import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useIching } from "../context/IchingContext";

//
// --- GLOBAL EFFECT BUS (basic reverb + compressor) ---
//   Individual lines will get their own stereo pan + reverb send level.
//   This global bus keeps everything cohesive.
//
const globalReverb = new Tone.Reverb({
  decay: 4,
  preDelay: 0.1,
  wet: 0.25,
}).toDestination();

const masterComp = new Tone.Compressor(-12, 3).connect(globalReverb);

export default function CastingSoundEngine() {
  const loopsRef = useRef({});
  const instrumentsRef = useRef({});
  const transportStarted = useRef(false);

  const { triggerLineMelody, setCastingStopper } = useIching();

  // -----------------------------------------------------------
  // Helper: stop all casting loops and reset transport
  // -----------------------------------------------------------
  const stopAllCastingLoops = () => {
    // Stop and dispose all loops
    Object.values(loopsRef.current).forEach((loop) => {
      if (!loop) return;
      try {
        loop.stop();
        loop.dispose();
      } catch (e) {
        console.warn("Error stopping loop:", e);
      }
    });
    loopsRef.current = {};

    // Hard mute instruments to avoid long tails
    Object.values(instrumentsRef.current).forEach((inst) => {
      if (!inst) return;
      try {
        if (inst.volume) {
          inst.volume.value = -60;
        }
      } catch (e) {
        console.warn("Error muting instrument:", e);
      }
    });

    // Stop and clear the transport
    try {
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
    } catch (e) {
      console.warn("Error stopping transport:", e);
    }

    // Allow a new run to start the transport again
    transportStarted.current = false;
  };

  // -----------------------------------------------------------
  // Register stopper into context so pages can call stopCastingMusic()
  // -----------------------------------------------------------
  useEffect(() => {
    // Register on mount
    setCastingStopper(() => stopAllCastingLoops);

    // Clean up on unmount
    return () => {
      setCastingStopper(null);
    };
  }, [setCastingStopper]);

  // -----------------------------------------------------------
  // Load sampler instruments with soft envelope + connect to bus
  // -----------------------------------------------------------
  useEffect(() => {
    async function loadInstruments() {
      instrumentsRef.current = {
        taiko: await loadSFZ("taiko_drum"),
        guzheng: await loadSFZ("orchestral_harp"),
        pipa: await loadSFZ("acoustic_guitar_nylon"),
        dizi: await loadSFZ("flute"),
        shakuhachi: await loadSFZ("shakuhachi"),
        koto: await loadSFZ("koto"),
        shamisen: await loadSFZ("shamisen"),
      };
    }
    loadInstruments();
  }, []);

  async function loadSFZ(name) {
    // Slightly softened sampler
    const sampler = new Tone.Sampler(
      {
        urls: {
          C4: `${name}-mp3/C4.mp3`,
          D4: `${name}-mp3/D4.mp3`,
          E4: `${name}-mp3/E4.mp3`,
          G4: `${name}-mp3/G4.mp3`,
          A4: `${name}-mp3/A4.mp3`,
        },
        baseUrl: `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/`,
        attack: 0.03,
        release: 1.8,
      }
    );

    // Each sampler goes through a per-instrument panner → master chain
    const pan = new Tone.Panner(0).connect(masterComp);
    sampler.connect(pan);
    sampler._pan = pan; // save reference to modify later

    return sampler;
  }

  // -----------------------------------------------------------
  // Pentatonic + helpers
  // -----------------------------------------------------------
  const instrumentOrder = ["taiko", "koto", "shakuhachi", "shamisen", "dizi", "pipa"];
  const pent = ["C", "D", "E", "G", "A"];
  const note = (deg, oct = 4) =>
    pent[(deg % pent.length + pent.length) % pent.length] + oct;

  // -----------------------------------------------------------
  // Generate melodic contour biased by yin/yang (coinSum)
  // -----------------------------------------------------------
  function patternRandom(start, coin) {
    let out = [start];
    let cur = start;

    for (let i = 0; i < 7; i++) {
      const r = Math.random();
      if (coin === 3) cur += r < 0.8 ? 1 : -1;       // old yang → rising
      else if (coin === 0) cur += r < 0.8 ? -1 : 1;  // old yin → falling
      else cur += r < 0.4 ? 1 : r < 0.8 ? -1 : 0;    // neutral
      out.push(cur);
    }
    return out;
  }

  // -----------------------------------------------------------
  // Start a loop aligned to bar beginning
  // -----------------------------------------------------------
  function startLineLoop(row, coin) {
    const instName = instrumentOrder[row];
    const inst = instrumentsRef.current[instName];
    if (!inst) return;

    // Stop previous loop if exists
    if (loopsRef.current[row]) {
      try {
        loopsRef.current[row].stop();
        loopsRef.current[row].dispose();
      } catch (e) {
        console.warn("Error stopping previous loop:", e);
      }
    }

    // ------------------------------
    // Melody degrees + phrase length
    // ------------------------------
    const startDeg = Math.floor(Math.random() * pent.length);
    const degs = patternRandom(startDeg, coin);

    // coinSum affects phrase length
    let phraseLength;
    if (coin === 3) phraseLength = 6 + Math.floor(Math.random() * 3); // old yang → longer (6–8)
    else if (coin === 0) phraseLength = 3 + Math.floor(Math.random() * 2); // old yin → shorter (3–4)
    else phraseLength = 4 + Math.floor(Math.random() * 3); // neutral → medium (4–6)

    const truncDegs = degs.slice(0, phraseLength);
    const melody = truncDegs.map((d) => note(d, 4 + (row % 2)));

    // ------------------------------
    // Duration logic (yin/yang style)
    // ------------------------------
    let durChoices;

    if (coin === 3) {
      // old yang → long, floating notes
      durChoices = ["8n", "4n", "2n"];
    } else if (coin === 0) {
      // old yin → short, sparse, more silence
      durChoices = ["16n", "16n", "8n", "rest"];
    } else {
      durChoices = ["16n", "8n", "8n", "4n"];
    }

    const durations = melody.map(() => {
      const pick = durChoices[Math.floor(Math.random() * durChoices.length)];
      if (pick === "rest") return 0; // silent gap
      return Tone.Time(pick).toSeconds();
    });

    const totalDuration = durations.reduce((a, b) => a + b, 0.001);

    // ------------------------------
    // Stereo & space based on row
    // ------------------------------
    const pan = [-0.4, -0.2, 0, 0.2, 0.35, 0.45][row];
    const reverbWet = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4][row];

    inst._pan.pan.rampTo(pan, 1);
    globalReverb.wet.rampTo(reverbWet, 2);

    // ------------------------------
    // Fade-in volume
    // ------------------------------
    inst.volume.value = -18;
    inst.volume.linearRampToValueAtTime(-10, Tone.now() + 1.5);

    // ------------------------------
    // Loop aligned to upcoming bar
    // ------------------------------
    const startTime = Tone.Time("1m").toSeconds() * 1;
    // OR simply: const startTime = Tone.Transport.nextSubdivision("1m");

    loopsRef.current[row] = new Tone.Loop((time) => {
      let cursor = 0;
      melody.forEach((pitch, i) => {
        const dur = durations[i];

        if (dur === 0) {
          cursor += Tone.Time("16n").toSeconds(); // small rest
          return;
        }

        const jitter = (Math.random() - 0.5) * 0.02;
        const velocity = 0.6 + Math.random() * 0.25;

        inst.triggerAttackRelease(
          pitch,
          dur,
          time + cursor + jitter,
          velocity
        );

        cursor += dur;
      });
    }, totalDuration).start(startTime);
  }

  // -----------------------------------------------------------
  // Trigger logic
  // -----------------------------------------------------------
  useEffect(() => {
    if (triggerLineMelody == null) return;

    async function startTransport() {
      if (!transportStarted.current) {
        await Tone.start();
        Tone.Transport.bpm.value = 80;
        await Tone.Transport.start();
        transportStarted.current = true;
      }

      const { rowIndex, coinSum } = triggerLineMelody;
      startLineLoop(rowIndex, coinSum);
    }

    startTransport();
  }, [triggerLineMelody]);

  return null;
}
