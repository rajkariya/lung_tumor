import path from "path"
import { defineConfig , loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default  ({ mode}) => { 
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  return defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
}