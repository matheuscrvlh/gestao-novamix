import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Metas from './pages/Metas'
import Estoque from './pages/Estoque'
import Validade from './pages/Validade'
import Promocoes from './pages/Promocoes'

export default function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/metas' element={<Metas />}/>
        <Route path='/estoque' element={<Estoque />}/>
        <Route path='/validade' element={<Validade />}/>
        <Route path='/promocoes' element={<Promocoes />}/>
      </Routes>
    </>
  )
}
