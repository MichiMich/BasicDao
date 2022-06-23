

export function proposalStateToText(proposalState: number) {
    const proposalStatesFromContract = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];

    if (proposalState < 0 || proposalState >= proposalStatesFromContract.length) {
        return "Unknown propasal state";
    }
    else {
        return proposalStatesFromContract[proposalState];
    }

}