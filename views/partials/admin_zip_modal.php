<div class="admin-modal-backdrop" id="adminR2GuideModal" role="dialog" aria-modal="true" aria-labelledby="r2GuideTitle" aria-describedby="albumZipDescription">
  <div class="admin-modal-content admin-zip-dialog">
    <button class="admin-modal-close" id="r2GuideModalClose" type="button" aria-label="Cerrar progreso">
      <svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m6 6 12 12M18 6 6 18"/></svg>
    </button>
    <span class="admin-eyebrow">Todos sus recuerdos</span>
    <h3 id="r2GuideTitle" class="admin-section-title">Descargar álbum</h3>
    <p id="albumZipDescription" class="admin-section-note">Incluye todas las fotos y videos publicados en un archivo comprimido.</p>
    <div id="albumZipProgressWrap" class="admin-zip-progress-wrap" aria-busy="false">
      <div class="admin-zip-progress-heading"><span id="albumZipStage">Listo para comenzar</span><strong id="albumZipPercent">0%</strong></div>
      <progress id="albumZipProgress" max="100" value="0" aria-label="Progreso de la descarga del álbum"></progress>
      <p id="albumZipStatus" class="admin-section-note" role="status" aria-live="polite">Prepararemos el álbum y la descarga comenzará automáticamente. Mantén esta página abierta.</p>
    </div>
    <div class="admin-confirm-actions">
      <button type="button" class="admin-btn admin-btn-outline" id="albumZipStop" hidden>Detener</button>
      <button type="button" class="admin-btn admin-btn-gold" id="albumZipRetry" hidden>Reintentar descarga</button>
      <button type="button" class="admin-btn admin-btn-gold" id="albumZipSave" hidden disabled>Descargar</button>
      <button type="button" class="admin-btn admin-btn-outline" id="r2GuideModalOk">Cerrar</button>
    </div>
  </div>
</div>
