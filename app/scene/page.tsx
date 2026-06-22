import SceneStage from './SceneStage'
import './scene.css'
import '../jazz-bar/styles.css'

export const metadata = {
  title: 'Wand Jazz Bar · Venue Mode',
}

export default function ScenePage() {
  return (
    <div className="jazz-bar-bg noise-texture">
      <div className="crt-overlay" />
      <SceneStage />
    </div>
  )
}
