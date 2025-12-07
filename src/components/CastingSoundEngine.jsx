import { useEffect, useRef } from "react";
import * as Tone from "tone";

export default function CastingSoundEngine({ triggerLineMelody }) {
  const loopsRef = useRef({});
  const instrumentsRef = useRef({});
  const transportStarted = useRef(false);

  // --------------------
  // 1. Load Instruments
  // --------------------
  useEffect(() => {
    async function loadInstruments() {
      instrumentsRef.current = {
        drum: await loadSFZ("taiko_drum"),
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
    return new Tone.Sampler({
      urls: {
        C4: `${name}-mp3/C4.mp3`,
        D4: `${name}-mp3/D4.mp3`,
        E4: `${name}-mp3/E4.mp3`,
        G4: `${name}-mp3/G4.mp3`,
        A4: `${name}-mp3/A4.mp3`
      },
      baseUrl: `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/`,
    }).toDestination();
  }


  // --------------------------
  // 2. Pentatonic Scale
  // --------------------------
  const pent = ["C", "D", "E", "G", "A"];
  const note = (deg, oct=4) => pent[(deg % pent.length + pent.length) % pent.length] + oct;

  // --------------------------
  // 3. Pattern rules 
  // --------------------------
  function patternRandom(start, coin) {
    let out = [start]; let cur = start;

    for (let i=0;i<7;i++){
      const r = Math.random();
      if (coin === 3) { cur += (r<0.7 ? 1 : -1); }          // Upward bias
      else if (coin === 0){ cur += (r<0.7 ? -1 : 1); }      // Downward bias
      else { cur += (r<0.33?1:r<0.66?-1:0); }               // Neutral / Changing
      out.push(cur);
    }
    return out;
  }
  const instrumentOrder = ["drum", "koto", "shakuhachi", "shamisen", "dizi", "pipa"];

  // --------------------------
  // 4. Called by parent when a line is cast
  // --------------------------
  useEffect(() => {
    if (triggerLineMelody == null) return;

    const startTransportAndLoop = async () => {
        if (!transportStarted.current) {
        await Tone.start(); // unlock AudioContext
        const transport = Tone.getContext().transport;
        transport.bpm.value = 80;
        await transport.start("+0.1");
        transportStarted.current = true;
        }

        const { rowIndex, coinSum } = triggerLineMelody;
        console.log(`Triggered to generate melody for row ${rowIndex} with coin sum of ${coinSum}`)
        startLineLoop(rowIndex, coinSum);
    };

    startTransportAndLoop();

  }, [triggerLineMelody]);

  // --------------------------
  // 5. Start Line Loop
  // --------------------------
  function startLineLoop(row, coin) {
    const instName = instrumentOrder[row];
    const inst = instrumentsRef.current[instName];
    if (!inst) return;

    // Stop previous loop if it exists
    if (loopsRef.current[row]) {
        console.log(`Found existing loop for row ${row}; stopping it.`)
        loopsRef.current[row].stop();
        loopsRef.current[row].dispose();
    }

    // Generate melody degrees
    const startDeg = Math.floor(Math.random()*pent.length);
    const degs = patternRandom(startDeg, coin);
    const melody = degs.map(d=>note(d, 4 + (row%2)));
    console.log(`Row ${row} melody: ${melody}`)

    // Rhythm
    const rhythm = ["4n","8n","8n","16n","2n"][Math.floor(Math.random()*5)];
    const stepTime = Tone.Time(rhythm);
    console.log(`Row ${row} rhythm: ${rhythm}`)

    // FADE IN instrument
    inst.volume.value = -30;
    inst.volume.linearRampToValueAtTime(-10, Tone.now() + 2);

    // Create Loop
    loopsRef.current[row] = new Tone.Loop((time)=>{
      melody.forEach((pitch,i)=>{
        inst.triggerAttackRelease(pitch, "8n", time + i*stepTime);
      });
    }, melody.length * stepTime).start(0);  // <-- IMPORTANT: always start at Transport 0 for alignment
  }

  return null;
}