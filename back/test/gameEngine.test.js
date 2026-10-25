import { test } from "node:test";
import assert from "node:assert/strict";
import { generateGameOutcome } from "../src/services/gameEngineService.js";
import { pickWeightedReward } from "../src/utils/pickWeightedReward.js";

for (const slug of ["flash", "fortune", "jackpot", "mystere", "lucky-7"]) {
  test(`${slug}: les symboles et le montant correspondent toujours au resultat`, () => {
    for (const probability of [0, 100]) {
      for (let round = 0; round < 50; round++) {
        const outcome = generateGameOutcome({ slug, name: slug, maxReward: 30, winProbability: probability }, [
          { amount: 30, label: "Lot", weight: 1 },
        ]);
        const expectedWin = probability === 100;
        assert.equal(outcome.isWin, expectedWin);
        assert.equal(outcome.reward, expectedWin ? 30 : 0);
        assert.equal(outcome.resultData.rewardAmount, outcome.reward);
        const cells = outcome.resultData.cells;
        assert.equal(new Set(cells.map((cell) => cell.id)).size, cells.length);
        assert.equal(cells.length, slug === "lucky-7" ? 9 : 6);
        const symbol = { flash: "bolt", fortune: "crown", jackpot: "seven", mystere: "question", "lucky-7": "seven" }[slug];
        const matching = cells.filter((cell) => cell.symbol === symbol).length;
        if (slug === "lucky-7") assert.ok(expectedWin ? matching === 3 : matching < 2);
        else assert.equal(matching, expectedWin ? (slug === "mystere" ? 2 : 1) : 0);
      }
    }
  });
}

test("une configuration incomplete est refusee plutot que de produire un faux gain", () => {
  const ticket = { slug: "flash", maxReward: 20, winProbability: 100 };
  assert.throws(() => generateGameOutcome(ticket, []));
  for (const amount of [0, -1, NaN, 21]) {
    assert.throws(() => generateGameOutcome(ticket, [{ amount, label: "Lot", weight: 1 }]));
  }
  assert.throws(() => generateGameOutcome({ ...ticket, slug: "inconnu" }, [{ amount: 2, weight: 1 }]));
});

test("les poids invalides sont refuses, y compris pour un ticket perdant", () => {
  for (const weight of [0, -1, 0.5, NaN, 2 ** 48]) {
    assert.throws(() => pickWeightedReward([{ amount: 2, weight }]));
    assert.throws(() => generateGameOutcome({ slug: "flash", maxReward: 20, winProbability: 0 }, [{ amount: 2, weight }]));
  }
});
