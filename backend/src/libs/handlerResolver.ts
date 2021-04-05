/**
 * Utility function to resolve the path to the handler 
 * @param context 
 */
export const handlerPath = (context: string) => {
  return `${context.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}`
};
