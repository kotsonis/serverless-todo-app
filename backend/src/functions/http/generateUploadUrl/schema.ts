export default {
    type: "object",
    properties: {
      file: { type: 'string' },
    },
    required: [
      'file', 
    ]
  } as const;
  