document.addEventListener("DOMContentLoaded", () => {

  const pageType = document.body.dataset.page;

/* ======================================================
   BOTÓN ATRÁS GLOBAL (RUTAS FIJAS)
====================================================== */

const backBtn = document.getElementById("backBtn");

if (backBtn) {
  backBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const target = backBtn.dataset.back || "/cotizacion.html";

    // Obtener nombre del archivo actual
    const page = window.location.pathname.split("/").pop();

    // Solo confirmar si empieza por "momentos_"
    const necesitaConfirmar = page.startsWith("momentos_");

    if (!necesitaConfirmar) {
      // Si no es momentos_, vuelve directo
      window.location.replace(target);
      return;
    }

    // Confirmación
    const confirmacion = confirm(
      "¿Seguro que quieres volver y crear una nueva cotización?\nSe perderán los datos actuales."
    );

    if (confirmacion) {
      window.location.replace(target);
    }
  });
}

/* ================= FAVICON GLOBAL ================= */

(function setFavicon() {

  const iconUrl = "https://digitalstrings.com.co/wp-content/uploads/2024/10/MONITOREO.png";

  let link = document.querySelector("link[rel='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.type = "image/png";
  link.href = iconUrl;

})();



  /* ======================================================
     LOGOUT GLOBAL (FUNCIONA EN TODAS LAS PÁGINAS)
  ====================================================== */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const confirmacion = confirm(
      "¿Estás seguro de que quieres cerrar sesión?\nSi sales, tendrás que iniciar sesión nuevamente."
    );

    // Si elige "Quedarme"
    if (!confirmacion) return;

    // Si elige "Salir"
    localStorage.clear();

    // Redirige al login
    window.location.replace("/index.html");
  });
}

  /* ======================================================
     LOGIN (index.html)
  ====================================================== */
  if (pageType === "login") {

    // 🔒 si ya estaba logueado, no puede volver al login
    if (localStorage.getItem("loggedIn") === "true") {
      window.location.replace("/cotizacion.html");
      return;
    }

    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginForm = document.getElementById("loginForm");
    const errorMsg = document.getElementById("errorMsg");

    togglePassword?.addEventListener("click", () => {
      const hidden = passwordInput.type === "password";
      passwordInput.type = hidden ? "text" : "password";
      togglePassword.textContent = hidden
        ? "visibility_off"
        : "visibility";
    });

    loginForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.textContent = "";

      const password = passwordInput.value.trim();
      if (!password) {
        errorMsg.textContent = "Ingresa la contraseña";
        return;
      }

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password })
        });

        const data = await res.json();
        if (!data.success) throw new Error();

        localStorage.setItem("loggedIn", "true");

        // replace evita volver con "atrás"
        window.location.replace("/cotizacion.html");

      } catch {
        errorMsg.textContent = "Contraseña incorrecta";
        passwordInput.value = "";
        passwordInput.focus();
      }
    });
  }

  /* ======================================================
     PROTECCIÓN GLOBAL (TODAS LAS PÁGINAS PRIVADAS)
  ====================================================== */
  if (pageType === "protected") {

    if (localStorage.getItem("loggedIn") !== "true") {
      // replace evita navegación hacia atrás
      window.location.replace("/index.html");
      return;
    }

    // Bloquea cache del navegador (MUY IMPORTANTE)
    window.addEventListener("pageshow", (event) => {
      if (event.persisted || localStorage.getItem("loggedIn") !== "true") {
        window.location.replace("/index.html");
      }
    });
  }

  /* ======================================================
     COTIZACIÓN – SELECCIÓN DE EVENTO
  ====================================================== */
  let selectedEvent = null;
  const eventCards = document.querySelectorAll(".card-event[data-event]");

  eventCards.forEach(card => {
    card.addEventListener("click", () => {
      eventCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedEvent = card.dataset.event;
    });
  });

  /* ======================================================
     BOTÓN CONTINUAR
  ====================================================== */
document.querySelector(".btn-continuar")?.addEventListener("click", () => {

  if (!selectedEvent) {
    alert("Selecciona un tipo de evento");
    return;
  }

  const cliente = document.getElementById("cliente")?.value.trim();
  const fechaRaw = document.getElementById("fecha")?.value;
  const lugar = document.getElementById("lugar")?.value.trim();

  if (!cliente || !fechaRaw || !lugar) {
    alert("Completa todos los campos");
    return;
  }

  // Normalizar texto del lugar
  const lugarNormalizado = lugar
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Detectar Retiro San Juan
  const esRetiroSanJuan =
    lugarNormalizado.includes("retiro") &&
    lugarNormalizado.includes("san") &&
    lugarNormalizado.includes("juan");

  // Guardar datos del evento
  const eventData = {
    tipo: selectedEvent,
    cliente,
    fecha: fechaRaw,
    lugar,
    esLugarEspecial: esRetiroSanJuan,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem("eventData", JSON.stringify(eventData));

  // Rutas normales
  const rutasNormales = {
    matrimonio: "/momentos_matrimonio.html",
    quince: "/momentos_quince.html",
    privado: "/momentos_privado.html"
  };

  // Ruta especial para Retiro San Juan
  const rutasEspeciales = {
    matrimonio: "/momentos_matrimonio_retiro.html",
    quince: "/momentos_quince_retiro.html",
    privado: "/momentos_privado_retiro.html"
  };

  // Elegir ruta
  let rutaFinal;

  if (esRetiroSanJuan) {
    rutaFinal = rutasEspeciales[selectedEvent];
  } else {
    rutaFinal = rutasNormales[selectedEvent];
  }

  window.location.replace(rutaFinal);

});

  /* ======================================================
     HEADER DINÁMICO (TODOS LOS MOMENTOS)
  ====================================================== */
const header = document.getElementById("eventHeader");

if (header) {

  const eventData = JSON.parse(localStorage.getItem("eventData"));

  if (eventData && eventData.tipo && eventData.cliente && eventData.fecha) {

    const [year, month, day] = eventData.fecha.split("-");

    const fecha = new Date(year, month - 1, day).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const labels = {
      matrimonio: "Matrimonio",
      quince: "XV Años",
      privado: "Evento Privado"
    };

    header.textContent = `${labels[eventData.tipo]} · ${eventData.cliente} · ${fecha}`;

  }

}

  /* ======================================================
   MOMENTOS → REDIRECCIÓN A FORMATO
====================================================== */

const momentCards = document.querySelectorAll(".card-event[data-moment]");

momentCards.forEach(card => {
  card.addEventListener("click", () => {

    // efecto visual persistente
    momentCards.forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    const moment = card.dataset.moment;

    // guardar momento (por si lo necesitas luego)
    localStorage.setItem("currentMoment", moment);

    // rutas automáticas
    const rutas = {
      ceremonia: "/formatos_ceremonia.html",
      coctel: "/formatos_coctel.html",
      protocolo: "/formatos_protocolo.html",
      cena: "/formatos_cena.html",
      fiesta: "/formatos_fiesta.html",
      iluminacion: "/formatos_iluminacion.html"
    };

    // pequeña pausa para que se vea el efecto
    setTimeout(() => {
      window.location.href = rutas[moment];
    }, 250);
  });
});

});

/* ================= VIDEO FULLSCREEN ================= */

document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("videoModal");
  const iframe = document.getElementById("modalIframe");
  const closeBtn = document.getElementById("closeVideo");

  if (!modal || !iframe || !closeBtn) return;

  // ABRIR VIDEO
  document.querySelectorAll(".select-video").forEach(btn => {

    btn.addEventListener("click", e => {
      e.preventDefault();

      let url = btn.dataset.video;

      if (!url) return;

      // Convertir link normal a embed
      if (url.includes("youtu.be")) {
        const id = url.split("youtu.be/")[1].split("?")[0];
        url = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      }

      iframe.src = url;

      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });

  });


  // CERRAR
  function closeVideo() {
    iframe.src = "";
    modal.style.display = "none";
    document.body.style.overflow = "";
  }


  closeBtn.addEventListener("click", closeVideo);


  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeVideo();
    }
  });


  modal.addEventListener("click", e => {
    if (e.target === modal) {
      closeVideo();
    }
  });


  /* ================= SLIDER NAV SIN SCROLL DE PÁGINA ================= */

const slider = document.querySelector(".slider");
const navButtons = document.querySelectorAll(".slider-nav a");

navButtons.forEach((btn, index) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const slideWidth = slider.clientWidth;
    slider.scrollTo({
      left: slideWidth * index,
      behavior: "smooth"
    });
  });
});

});