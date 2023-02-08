export const mockAddLabels = jest.fn().mockResolvedValue('Label Added');
export const mockRemoveLabel = jest.fn().mockResolvedValue('Label Removed');

export const Octokit = jest.fn().mockImplementation(() => ({
  issues: {
    addLabels: mockAddLabels,
    removeLabel: mockRemoveLabel,
  },
}));
