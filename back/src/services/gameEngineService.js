import { pickWeightedReward } from "../utils/pickWeightedReward.js";

const FILLER_SYMBOLS = {
  flash: ["coin", "star", "spark", "gem", "coin"],
  fortune: ["diamond", "key", "clover", "coin", "gem"],
  jackpot: ["diamond", "cherry", "coin", "gem", "star"],
  mystere: ["question", "moon", "star", "spark", "gem"],
  "lucky-7": ["clover", "bell", "star", "cherry", "coin"],
};

const WIN_SYMBOLS = {
  flash: "bolt",
  fortune: "crown",
  jackpot: "seven",
  mystere: "question",
  "lucky-7": "seven",
};

const TICKET_RULES = {
  flash: "Trouve l'eclair gagnant pour remporter le montant du ticket.",
  fortune: "Trouve la couronne royale pour debloquer un gain fortune.",
  jackpot: "Trouve le 7 rare pour toucher les plus gros gains.",
  mystere: "Revele deux cases mystere gagnantes pour decouvrir le palier cache.",
  "lucky-7": "Obtiens au moins deux symboles 7 pour gagner. Trois 7 donnent les meilleurs lots.",
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildClassicBoard(slug, isWin, reward) {
  const symbols = FILLER_SYMBOLS[slug];
  const cells = Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    symbol: randomItem(symbols),
    label: "Case perdante",
    caption: null,
    variant: "neutral",
  }));

  if (isWin) {
    const winningIndex = Math.floor(Math.random() * cells.length);
    cells[winningIndex] = {
      id: winningIndex + 1,
      symbol: WIN_SYMBOLS[slug],
      label: reward.label,
      caption: `+${reward.amount}`,
      variant: "win",
    };
  }

  return {
    mode: "grid",
    columns: 3,
    cells,
  };
}

function buildMystereBoard(isWin, reward) {
  const mysteryCards = FILLER_SYMBOLS.mystere;
  const cells = Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    symbol: randomItem(mysteryCards),
    label: "Case mystere",
    caption: null,
    variant: "neutral",
  }));

  if (isWin) {
    const winningCells = new Set();
    while (winningCells.size < 2) {
      winningCells.add(Math.floor(Math.random() * cells.length));
    }

    for (const cellIndex of winningCells) {
      cells[cellIndex] = {
        id: cellIndex + 1,
        symbol: WIN_SYMBOLS.mystere,
        label: reward.label,
        caption: `+${reward.amount}`,
        variant: "win",
      };
    }
  }

  return {
    mode: "grid",
    columns: 3,
    cells,
  };
}

function buildLuckySevenBoard(isWin, reward) {
  const symbols = FILLER_SYMBOLS["lucky-7"];
  const cells = Array.from({ length: 9 }, (_, index) => ({
    id: index + 1,
    symbol: randomItem(symbols),
    label: "Symbole neutre",
    caption: null,
    variant: "neutral",
  }));

  const sevenCount = isWin ? (reward.amount >= 30 ? 3 : 2) : Math.random() < 0.5 ? 1 : 0;
  const chosenIndexes = new Set();

  while (chosenIndexes.size < sevenCount) {
    chosenIndexes.add(Math.floor(Math.random() * cells.length));
  }

  for (const index of chosenIndexes) {
    cells[index] = {
      id: index + 1,
      symbol: "seven",
      label: isWin ? reward.label : "7",
      caption: null,
      variant: isWin ? "win" : "neutral",
    };
  }

  return {
    mode: "grid",
    columns: 3,
    cells,
  };
}

function buildResultData(ticket, isWin, reward) {
  const rewardAmount = isWin ? reward.amount : 0;
  const rewardLabel = isWin ? reward.label : "Aucun gain";

  let board;

  if (ticket.slug === "mystere") {
    board = buildMystereBoard(isWin, reward);
  } else if (ticket.slug === "lucky-7") {
    board = buildLuckySevenBoard(isWin, reward);
  } else {
    board = buildClassicBoard(ticket.slug, isWin, reward);
  }

  return {
    ...board,
    headline: ticket.name,
    rewardLabel,
    rewardAmount,
    summary: isWin
      ? `Bravo ! Tu remportes ${reward.amount} credits.`
      : "Pas de gain cette fois. Retente ta chance.",
    winRule: TICKET_RULES[ticket.slug],
    isJackpot: rewardAmount === ticket.maxReward,
  };
}

export function generateGameOutcome(ticket, rewards) {
  const isWin = Math.random() * 100 < ticket.winProbability;
  const reward = isWin && rewards.length > 0 ? pickWeightedReward(rewards) : { label: "Perdu", amount: 0 };

  return {
    isWin,
    reward: Number(reward.amount || 0),
    resultData: buildResultData(ticket, isWin, reward),
  };
}
