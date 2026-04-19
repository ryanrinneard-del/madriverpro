/* ============================================================
   RR Golf Performance — Game Improvement Library
   Minimal client: auth guard, nav mount.
   Runs alongside /adult/ and /portal/ — shares their Supabase session.
   ============================================================ */

window.RRG = window.RRG || {};

RRG.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

RRG._sbReady = (async () => {
  if (!window.supabase || !window.SUPABASE_CONFIG) return;
  RRG.sb = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );
})();

/* Returns the logged-in user's profile, or null. */
RRG.currentUser = async function () {
  await RRG._sbReady;
  if (!RRG.sb) return null;
  const { data: { session } } = await RRG.sb.auth.getSession();
  if (!session) return null;
  const { data } = await RRG.sb
    .from('profiles').select('*').eq('id', session.user.id).maybeSingle();
  return data || null;
};

/* Renders the top nav and returns {user, homePath}.
   homePath = the portal the user should be sent back to. */
RRG.mountLibrary = async function () {
  const user = await RRG.currentUser();
  if (!user) {
    // Not logged in — bounce to the adult login page with a redirect back.
    const here = encodeURIComponent(location.pathname);
    location.replace('/adult/index.html?back=' + here);
    return null;
  }
  const homePath = user.cohort === 'junior_elite_2026' ? '/portal/dashboard.html'
                 : user.cohort === 'adult_coaching_2026' ? '/adult/dashboard.html'
                 : '/adult/dashboard.html';

  const navMount = document.getElementById('nav-mount');
  if (navMount) {
    navMount.outerHTML = `
      <nav class="top-nav">
        <a href="index.html" class="brand"><span class="diamond"></span>RR GOLF · LIBRARY</a>
        <a href="${homePath}" class="back-link">← BACK TO PORTAL</a>
      </nav>
    `;
  }
  return { user, homePath };
};
