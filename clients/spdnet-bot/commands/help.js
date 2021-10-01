module.exports = {
  components: [
    {
      type: 1,
      components: [
        {
          style: 5,
          label: `Download latest`,
          url: `https://github.com/saqfish/spdnet/releases`,
          disabled: false,
          type: 2,
        },
      ],
    },
  ],
  embeds: [
    {
      type: "rich",
      title: `Welcome to SPDNet!`,
      description: `SPDNet is a shattered pixel dungeon mod that lets you:\n\n- See other players on in-game\n- Chat with other players in-game\n- Share items with other players\n- Record your win to the global ranking\n\nThe server also:\n\n- Automatically sends you asset updates (for events)\n- Manages the seed you play on (we update seeds weekly)`,
      color: 0x020202,
      fields: [
        {
          name: `Registration is is required on this server. To get your key simply type:`,
          value: `\`!register\``,
        },
        {
          name: `View bot commands by typing:`,
          value: `\`!commands\``,
        },
      ],
    },
  ],
};
