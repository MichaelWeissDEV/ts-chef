import manifest from "../package.json";

describe("pipeline graph command contribution", () => {
  test("is available from the command palette and Pipelines view", () => {
    const commands = manifest.contributes.commands as Array<{
      command: string;
      title: string;
      icon?: string;
    }>;
    expect(commands).toContainEqual({
      command: "tschef.openPipelineGraph",
      title: "tschef: Open Pipeline Graph",
      icon: "$(type-hierarchy)",
    });

    const viewTitle = manifest.contributes.menus["view/title"] as Array<{
      command: string;
      when?: string;
    }>;
    expect(viewTitle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: "tschef.openPipelineGraph",
          when: "view == tschef.pipelinesView",
        }),
      ]),
    );
  });
});
