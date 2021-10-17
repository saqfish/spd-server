module.exports = {
  embeds: [
    {
      type: "rich",
      title: `Commands`,
      description: `The SPDNet bot has the following commands`,
      color: 0x020202,
      fields: [
        {
          name: `Registration`,
          value: `\`!register\``,
        },
        {
          name: `View online players`,
          value: `\`!online\``,
        },
        {
          name: `Give a player an item`,
          value: `\`\`\`!give [item count] [item class name] [item level]\`\`\`\nItem class names can be found [here](https://github.com/saqfish/spdnet/tree/master/core/src/main/java/com/saqfish/spdnet/items)`,
        },
        {
          name: `Change the current seed`,
          value: `\`!seed [seed number]\``,
        },
        {
          name: `Get help`,
          value: `\`!help\``,
        },
      ],
    },
  ],
};
