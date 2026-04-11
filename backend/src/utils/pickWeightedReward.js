export function pickWeightedReward(rewards) {
  const totalWeight = rewards.reduce((sum, reward) => sum + Number(reward.weight), 0);
  let cursor = Math.random() * totalWeight;

  for (const reward of rewards) {
    cursor -= Number(reward.weight);
    if (cursor <= 0) {
      return reward;
    }
  }

  return rewards[rewards.length - 1];
}

