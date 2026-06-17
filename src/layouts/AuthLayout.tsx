import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ShieldCheck } from 'lucide-react'

import { Brand } from '@/components/dashboard/Brand'
import welcomeBg from '@/assets/images/Welcome.png'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen w-full overflow-hidden bg-[#FAFAF8] font-sans lg:grid-cols-[54%_46%]">
      {/* Panel izquierdo — visual oscuro con clip-path diagonal y fullscreen */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 hidden h-full flex-col justify-between text-white lg:flex"
        style={{ 
          clipPath: 'polygon(0 0, 96% 0, 100% 100%, 0 100%)',
          backgroundImage: `linear-gradient(90deg, rgba(14, 23, 48, 0.82), rgba(14, 23, 48, 0.62)), url('${welcomeBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Pseudo-elemento sombra para la diagonal */}
        <div className="pointer-events-none absolute bottom-0 right-[-28px] top-0 h-full w-[56px] bg-gradient-to-r from-[rgba(14,23,48,0.28)] to-[rgba(14,23,48,0)] blur-[12px]" />

        <div className="relative z-20 flex h-full flex-col justify-between px-12 py-16 xl:px-20 xl:py-20">
          <div>
            <Brand light subtitle="PANEL ADMINISTRATIVO" />
          </div>

          <div className="mt-auto mb-auto max-w-lg space-y-6">
            <h1 className="font-serif text-[clamp(3rem,5vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-white">
              Administra experiencias,
              <br />
              <span className="text-[#D89B1F]">no solo destinos.</span>
            </h1>

            <p className="max-w-[460px] text-[1.05rem] leading-[1.7] text-white/80 font-medium">
              Gestiona destinos, contenido multimedia, anuncios internos y operación administrativa desde un panel diseñado para darte control y claridad.
            </p>
          </div>

          <div className="mt-16 space-y-6">
            <div className="flex items-start gap-4">
              <BookOpen className="mt-0.5 h-6 w-6 text-[#D89B1F]" />
              <div>
                <h3 className="font-semibold text-white">Catálogo centralizado</h3>
                <p className="mt-1 text-[15px] text-white/60">Destinos siempre organizados y actualizados.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-0.5 h-6 w-6 text-[#D89B1F]" />
              <div>
                <h3 className="font-semibold text-white">Control administrativo seguro</h3>
                <p className="mt-1 text-[15px] text-white/60">Acceso protegido y roles con permisos.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Panel derecho — formulario fullscreen */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-12 lg:px-16 xl:px-24"
      >
        <div className="w-full max-w-[420px]">
          {/* Logo móvil */}
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          
          <Outlet />
        </div>
      </motion.div>
    </div>
  )
}

