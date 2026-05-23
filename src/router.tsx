import { createRouter as createReactRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

let routerInstance: ReturnType<typeof createReactRouter> | null = null;

export function createRouter() {
  const queryClient = new QueryClient();

  const router = createReactRouter({
    routeTree,
    context: {
      queryClient,
    },
  });

  routerInstance = router;
  return router;
}

export function getRouter() {
  if (!routerInstance) {
    return createRouter();
  }
  return routerInstance;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
