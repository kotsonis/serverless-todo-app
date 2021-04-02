export default {
    type: "object",
    properties: {
      name: { type: 'string' },
      dueDate: {type: 'string'}
    },
    required: [
      'name', 
      'dueDate'
    ]
  } as const;
  