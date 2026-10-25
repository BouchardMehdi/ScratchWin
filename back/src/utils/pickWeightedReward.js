import { randomInt } from "node:crypto";

export function pickWeightedReward(rewards) {
  const totalWeight = rewards.reduce((sum, reward) => sum + Number(reward.weight), 0);
  if (!rewards.length || rewards.some((reward) => !Number.isSafeInteger(reward.weight) || reward.weight <= 0) || !Number.isSafeInteger(totalWeight) || totalWeight >= 2 ** 48) {
    throw new Error("La configuration des poids des lots est invalide.");
  }
  let cursor = randomInt(totalWeight);

  for (const reward of rewards) {
    cursor -= Number(reward.weight);
    if (cursor < 0) {
      return reward;
    }
  }

  return rewards[rewards.length - 1];
}

