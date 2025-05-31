import { createFileRoute } from '@tanstack/react-router'
import { FFmpegProvider, ImageToVideoConverter } from '@/components/ffmpeg'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <>
      <title>NeoSliden - VRCD</title>
      <FFmpegProvider>
        <ImageToVideoConverter />
      </FFmpegProvider>
    </>
  )
}
