import { celebrateMilestone, CelebrateMilestoneOptions } from "../utils/celebration";

// Mascot-branded success toast + haptics + confetti for positive moments.
// Backward-compatible with all existing callers.
export function celebrate(
  message: string,
  subMessage?: string,
  options?: CelebrateMilestoneOptions
) {
  celebrateMilestone(message, subMessage, options);
}

export { triggerConfetti, triggerHaptic } from "../utils/celebration";
