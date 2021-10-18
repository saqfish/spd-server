module.exports = {
  filename:
    "https://raw.githubusercontent.com/saqfish/spd-server/master/clients/spdnet-bot/commands/update.png",
  components: [
    {
      type: 1,
      components: [
        {
          style: 5,
          label: `Download`,
          url: `https://github.com/saqfish/spdnet/releases/tag/v1.0.3-alpha-7.4`,
          disabled: false,
          type: 2,
        },
      ],
    },
  ],
  embeds: [
    {
      type: "rich",
      title: `Mandatory update!`,
      description: `In this update, I've added two things:\n\n1. Players will now see when other players join or leave in their game log.\n2. The !give command can now give up to 10,000 of each item.\n\nEnjoy!\n`,
      color: 0xff0000,
      url: `https://github.com/saqfish/spdnet/releases/tag/v1.0.3-alpha-7.4`,
    },
  ],
};
