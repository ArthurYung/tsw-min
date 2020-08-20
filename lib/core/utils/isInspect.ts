function checkNodeOptions(): boolean {
  return process.env.NODE_OPTIONS 
    && process.env.NODE_OPTIONS.startsWith('--inspect')
}

function checkExecArgs(): boolean {
  const args = process.execArgv;
  for(let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--inspect')) return true
  }
  return false
}

export const isInspect = (function():boolean {
  return checkNodeOptions() || checkExecArgs()
})()

