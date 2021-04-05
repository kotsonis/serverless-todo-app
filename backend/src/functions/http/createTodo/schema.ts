export default {
    type: "object",
    properties: {
      name: { 
        type: 'string',
      pattern: '^(?!\s*$).+' },
      dueDate: {type: 'string'}
    },
    required: [
      'name', 
      'dueDate'
    ]
  } as const;
  