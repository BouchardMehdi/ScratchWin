export const ticketUiBySlug = {
  flash: {
    title: "FLASH",
    collection: "L'instant électrique",
    tagline: "Une étincelle peut tout changer.",
    shortRule: "Un éclair, et c'est gagné !",
    foil: "silver",
    winRule: "Trouve un éclair parmi les 6 cases pour remporter le lot indiqué.",
    symbols: ["bolt", "coin", "star"],
  },
  fortune: {
    title: "Fortune",
    collection: "La collection royale",
    tagline: "La chance a trouvé sa couronne.",
    shortRule: "La couronne ouvre le trésor.",
    foil: "gold",
    winRule: "Trouve une couronne parmi les 6 cases pour remporter le lot indiqué.",
    symbols: ["crown", "diamond", "key"],
  },
  jackpot: {
    title: "JACKPOT",
    collection: "Sous les projecteurs",
    tagline: "Les grands rêves commencent ici.",
    shortRule: "Trouve le 7 qui change tout.",
    foil: "silver",
    winRule: "Trouve le symbole 7 parmi les 6 cases pour remporter le lot indiqué.",
    symbols: ["seven", "diamond", "cherry"],
  },
  mystere: {
    title: "Mystère",
    collection: "Les secrets de la nuit",
    tagline: "Le destin garde encore son secret.",
    shortRule: "Deux mystères, une révélation.",
    foil: "lilac",
    winRule: "Révèle deux symboles ? gagnants parmi les 6 cases pour découvrir ton lot. Le montant indiqué est le gain total du ticket.",
    symbols: ["question", "moon", "gem"],
  },
  "lucky-7": {
    title: "LUCKY 7",
    collection: "Le grand classique",
    tagline: "Un peu de trèfle. Beaucoup de chance.",
    shortRule: "Deux 7 gagnent. Trois voient grand.",
    foil: "gold",
    winRule: "Obtiens au moins deux symboles 7 parmi les 9 cases. Trois 7 donnent les meilleurs lots.",
    symbols: ["seven", "clover", "bell"],
  },
};

export function getTicketUi(slug) {
  return (
    ticketUiBySlug[slug] || {
      title: "ScratchWin",
      collection: "La collection ScratchWin",
      tagline: "La surprise est sous vos doigts.",
      shortRule: "Grattez pour découvrir votre résultat.",
      foil: "silver",
      winRule: "Gratte les cases pour reveler le resultat du ticket.",
      symbols: ["star", "coin", "gem"],
    }
  );
}
