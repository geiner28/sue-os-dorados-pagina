# Rifas Doradas — Página pública

Landing estática de reserva online (Proyecto NMAX). Lista para desplegar en **Netlify**.

## Despliegue en Netlify

1. Conecta este repositorio en [Netlify](https://app.netlify.com/).
2. Configuración sugerida:
   - **Build command:** (vacío o `exit 0`)
   - **Publish directory:** `.` (raíz del repo)
3. Deploy. La home es `index.html`.

También puedes arrastrar la carpeta del repo a [Netlify Drop](https://app.netlify.com/drop).

## API

La reserva apunta a Railway en `js/config.js`:

- `API_URL` — backend `/api`
- `API_KEY` — clave pública de ventas online

## Estructura

```
index.html          # Landing + flujo de reserva
css/                # Estilos
js/                 # App, hero, motion, config
assets/nmax/web/    # Fotos optimizadas
logo.png / titulo.png / nmax-hero.png / nmax-silueta.png
netlify.toml        # Config Netlify
```

## Desarrollo local

```bash
python3 -m http.server 8080
```

Abre `http://localhost:8080`.
