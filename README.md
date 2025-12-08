# Dev Setup
1. Install Node: https://nodejs.org/zh-cn/download
2. In order to be compatible with tailwindcss:
```
nvm install 20
nvm use 20
```
3. Run 
```
npm install
```
## Dev Setup
The interpretation stage uses APIs for LLM and Lyria text-to-music generation. Google AI Studio API Key. 
Please generate and use your own key with the following steps:
1. Go to https://aistudio.google.com/api-keys
2. Create API Key (input your customized name and project)
3. Copy Key and add to .env file 
```
VITE_GEMINI_API_KEY=<Your API Key>
```
It is recommend not to push the .env change to prevent key leakage.

# Test Locally
```
npm run dev
```

