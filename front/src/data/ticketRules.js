export const ticketUiBySlug = {
  flash: {
    winRule: "Trouve l'eclair gagnant. C'est le ticket le plus simple et le plus rapide.",
    symbols: ["bolt", "coin", "star"],
  },
  fortune: {
    winRule: "Trouve la couronne royale pour debloquer un gain moyen ou premium.",
    symbols: ["crown", "diamond", "key"],
  },
  jackpot: {
    winRule: "Trouve le 7 rare pour toucher les plus gros gains du jeu.",
    symbols: ["seven", "diamond", "cherry"],
  },
  mystere: {
    winRule: "Revele deux cases mystere gagnantes pour decouvrir le palier cache.",
    symbols: ["question", "moon", "gem"],
  },
  "lucky-7": {
    winRule: "Obtiens au moins deux symboles 7 pour gagner. Trois 7 valent les meilleurs lots.",
    symbols: ["seven", "clover", "bell"],
  },
};

export function getTicketUi(slug) {
  return (
    ticketUiBySlug[slug] || {
      winRule: "Gratte les cases pour reveler le resultat du ticket.",
      symbols: ["star", "coin", "gem"],
    }
  );
}
