import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Saída estática: a hospedagem é Apache + PHP compartilhado, sem Node em
// produção. `format: "directory"` gera rota/index.html, que o Apache serve
// sem regra de reescrita, e `trailingSlash: "always"` fixa uma única forma
// de URL (a outra recebe 301 no .htaccess).
export default defineConfig({
  site: "https://itechsolucoesdigitais.com",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
    // CSS sempre em arquivo, para a CSP não precisar de 'unsafe-inline'
    // em blocos <style>.
    inlineStylesheets: "never",
  },
  integrations: [
    sitemap({
      // As páginas de retorno do formulário (/contato/obrigado/ etc.) têm
      // noindex e ficam fora do sitemap. Página nova que não deve ser
      // indexada precisa das duas coisas: noindex e entrada neste filtro.
      // ferramentas/verificar-sitemap.mjs acusa quando só uma existe.
      filter: (page) => {
        const { pathname } = new URL(page);
        if (pathname.startsWith("/contato/") && pathname !== "/contato/") {
          return false;
        }
        return true;
      },
    }),
  ],
  devToolbar: {
    enabled: false,
  },
});
