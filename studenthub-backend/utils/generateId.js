export function generateId(prefix){ return `${prefix}${Date.now()}${Math.floor(Math.random()*1000)}`; }
