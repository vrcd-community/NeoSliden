import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ImageProvider } from "@/lib/ImageContext"

import Header from '../components/Header'

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />

      <ImageProvider>
        <div className="min-h-screen py-20 px-4">
          <Outlet />
        </div>
      </ImageProvider>
      <TanStackRouterDevtools />
    </>
  ),
})
