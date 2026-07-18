(function () {
  const cfg = window.RESERVA_CONFIG || {};
  const API_URL = (cfg.API_URL || '').replace(/\/$/, '');
  const API_KEY = cfg.API_KEY || '';

  const params = new URLSearchParams(location.search);
  let token = params.get('token') || '';
  let reference = params.get('reference') || '';
  let transactionId = params.get('id') || params.get('transaction_id') || '';

  if (!reference && transactionId && String(transactionId).startsWith('SD-')) {
    reference = transactionId;
    transactionId = '';
  }

  try {
    const saved = JSON.parse(sessionStorage.getItem('sd_last_pago') || 'null');
    if (saved) {
      if (!token && saved.token) token = saved.token;
      if (!reference && saved.reference) reference = saved.reference;
    }
  } catch (_) {
    /* ignore */
  }

  const statusEl = document.getElementById('pago-status');
  const cardEl = document.getElementById('pago-card');
  const leadEl = document.getElementById('pago-lead');

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function money(n) {
    return Number(n || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }

  async function api(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...(options.headers || {}),
      },
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 429) {
      const err = new Error(json.message || 'Demasiadas consultas');
      err.status = 429;
      throw err;
    }
    if (!res.ok || json.success === false) {
      throw new Error(json.message || 'Error consultando pago');
    }
    return json.data;
  }

  function confirmButtonHtml() {
    return `<button type="button" class="btn-gold cut" id="btn-confirmar-pago" style="margin-top:1rem;min-height:48px;padding:0 1.25rem">
      Confirmar pago ahora
    </button>`;
  }

  function bindConfirmButton() {
    const btn = document.getElementById('btn-confirmar-pago');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Confirmando…';
      try {
        const synced = await syncOnce();
        if (synced?.reference && !reference) reference = synced.reference;
        if (isApproved(synced)) {
          renderApproved(synced);
          return;
        }
        if (isRejected(synced)) {
          renderDeclined(synced, 'Pago no aprobado en Wompi');
          return;
        }
        renderPending(
          synced,
          `Estado en Wompi: ${synced?.status || 'PENDING'}. Si ya te cobró, espera unos segundos y vuelve a confirmar.`
        );
      } catch (err) {
        renderPending(null, err.message || 'No se pudo confirmar aún');
      }
    });
  }

  function renderPending(info, extraMsg) {
    if (leadEl) leadEl.textContent = 'Estamos confirmando tu pago…';
    if (cardEl) {
      cardEl.innerHTML = `
        <div class="status-box" id="pago-status">
          <strong style="display:block;margin-bottom:0.5rem;color:#f3c45d">Pendiente de confirmación</strong>
          ${escapeHtml(extraMsg || 'Buscando el pago aprobado en Wompi…')}<br/>
          ${reference ? `<div style="font-size:0.8rem;opacity:0.7;margin-top:0.5rem">Ref: ${escapeHtml(reference)}</div>` : ''}
          ${transactionId ? `<div style="font-size:0.75rem;opacity:0.55;margin-top:0.25rem">Tx: ${escapeHtml(transactionId)}</div>` : ''}
          ${info?.amount != null || info?.monto_total != null ? `<div style="margin-top:0.75rem">${money(info.amount ?? info.monto_total)}</div>` : ''}
          ${confirmButtonHtml()}
        </div>
      `;
      bindConfirmButton();
    }
  }

  function renderApproved(info) {
    const boletasUrl = token
      ? `./mis-boletas.html?token=${encodeURIComponent(token)}`
      : './mis-boletas.html';
    if (leadEl) {
      leadEl.textContent = token
        ? '¡Pago confirmado! Estamos preparando tus boletas pagadas…'
        : '¡Pago confirmado! Ya puedes descargar tus boletas.';
    }
    if (cardEl) {
      cardEl.innerHTML = `
        <div style="text-align:center">
          <div class="verify-badge">
            <span style="width:8px;height:8px;border-radius:50%;background:#34d399;display:inline-block"></span>
            PAGO APROBADO
          </div>
          <p class="verify-nums" style="font-size:1.4rem;margin:0.75rem 0">${money(info.amount ?? info.monto_total)}</p>
          <p style="color:#a8a29a;margin:0 0 1rem">Estado: ${escapeHtml(info.estado_venta || info.estado || 'PAGADA')}</p>
          <a class="btn-gold cut" href="${boletasUrl}" style="display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:0 1.25rem;text-decoration:none">
            Ver y guardar mis boletas
          </a>
          <p style="margin-top:1rem;font-size:0.8rem;color:#78716c">
            ${reference ? `Referencia: ${escapeHtml(reference)}` : ''}
          </p>
        </div>
      `;
    }
    if (token) {
      window.setTimeout(() => {
        window.location.replace(boletasUrl);
      }, 1200);
    }
  }

  function renderDeclined(info, label) {
    if (leadEl) leadEl.textContent = 'No se pudo completar el pago.';
    if (cardEl) {
      cardEl.innerHTML = `
        <div class="status-box is-error">
          <strong style="display:block;margin-bottom:0.5rem">${escapeHtml(label || 'Pago no aprobado')}</strong>
          En Sandbox usa Nequi <code>3991111111</code> o tarjeta <code>4242…4242</code>.
          <div style="margin-top:1rem;display:flex;flex-wrap:wrap;gap:0.6rem;justify-content:center">
            <a class="btn-gold cut" href="./index.html#reservar" style="display:inline-flex;min-height:44px;align-items:center;padding:0 1rem;text-decoration:none">Volver a participar</a>
            <a class="btn-ghost cut" href="./mis-boletas.html" style="display:inline-flex;min-height:44px;align-items:center;padding:0 1rem;text-decoration:none">Mis boletas</a>
          </div>
        </div>
      `;
    }
  }

  function isApproved(info) {
    if (!info) return false;
    if (info.puede_descargar) return true;
    const estado = String(info.estado_venta || info.estado || '').toUpperCase();
    const status = String(info.status || info.pago?.status || '').toUpperCase();
    return estado === 'PAGADA' || status === 'APPROVED';
  }

  function isRejected(info) {
    const status = String(info?.status || info?.pago?.status || '').toUpperCase();
    return ['DECLINED', 'VOIDED', 'ERROR'].includes(status);
  }

  async function syncOnce() {
    if (!reference && !transactionId && !token) {
      throw new Error('No encontramos la referencia del pago');
    }
    return api('/ventas-online/pagos/sincronizar', {
      method: 'POST',
      body: JSON.stringify({
        reference: reference || null,
        transaction_id: transactionId || null,
        reserva_token: token || null,
      }),
    });
  }

  async function run() {
    if (!token && !reference && !transactionId) {
      renderDeclined(null, 'No encontramos la referencia del pago');
      return;
    }

    renderPending(null, 'Sincronizando con Wompi…');

    try {
      const synced = await syncOnce();
      if (synced?.reference && !reference) reference = synced.reference;
      if (isApproved(synced)) {
        renderApproved(synced);
        return;
      }
      if (isRejected(synced)) {
        renderDeclined(synced, 'Pago no aprobado');
        return;
      }
      renderPending(
        synced,
        `Wompi aún reporta: ${synced?.status || 'PENDING'}. Si ya pagaste con éxito, pulsa «Confirmar pago ahora».`
      );
    } catch (err) {
      renderPending(null, err.message || 'No se pudo sincronizar todavía');
    }

    let attempts = 0;
    const maxAttempts = 36; // ~3 min con intervalo de 5s
    while (attempts < maxAttempts) {
      attempts += 1;
      await new Promise((r) => setTimeout(r, 5000));
      try {
        const synced = await syncOnce();
        if (synced?.reference && !reference) reference = synced.reference;
        if (isApproved(synced)) {
          renderApproved(synced);
          return;
        }
        if (isRejected(synced)) {
          renderDeclined(synced, 'Pago no aprobado');
          return;
        }
        renderPending(
          synced,
          `Estado: ${synced?.status || 'PENDING'}. Intento ${attempts}/${maxAttempts}`
        );
      } catch (err) {
        if (err.status === 429) {
          renderPending(null, 'Esperando para no saturar consultas…');
          await new Promise((r) => setTimeout(r, 10000));
        } else {
          renderPending(null, err.message || 'Reintentando…');
        }
      }
    }

    if (leadEl) {
      leadEl.textContent =
        'No llegó la confirmación automática. Si Wompi mostró pago exitoso, pulsa «Confirmar pago ahora» o escribe por WhatsApp con la referencia.';
    }
  }

  // Si el usuario vuelve a la pestaña, reintentar sync de inmediato
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && (reference || token || transactionId)) {
      syncOnce()
        .then((synced) => {
          if (isApproved(synced)) renderApproved(synced);
        })
        .catch(() => {});
    }
  });

  run();
})();
