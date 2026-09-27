/**
 * Simulation Event Definitions & Formatter
 */

export function createLogEntry(text, type = 'info', meta = {}) {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
  
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    time: timeStr,
    text,
    type, // 'info' | 'exchange' | 'update' | 'converged' | 'dijkstra' | 'warning' | 'error'
    meta,
  };
}

export function generateEventLogs(algorithmResult) {
  const logs = [];

  if (!algorithmResult) return logs;

  if (algorithmResult.algorithm.includes('Distance Vector')) {
    logs.push(createLogEntry(`🚀 Distance Vector simulation initiated.`, 'info'));
    logs.push(createLogEntry(`Routers initialized routing tables with direct link interfaces.`, 'info'));

    if (algorithmResult.rounds) {
      for (const round of algorithmResult.rounds) {
        if (round.round === 0) continue;

        logs.push(createLogEntry(`📡 Round ${round.round}: Routers exchanged distance vectors with neighbors (${round.messages.length} messages).`, 'exchange'));

        if (round.updates && round.updates.length > 0) {
          for (const u of round.updates) {
            logs.push(createLogEntry(u.explanation, 'update', { router: u.router, dest: u.destination }));
          }
          logs.push(createLogEntry(`Round ${round.round} finished with ${round.updates.length} table update(s).`, 'info'));
        } else {
          logs.push(createLogEntry(`Round ${round.round}: 0 updates. Routing tables are consistent.`, 'info'));
        }
      }
    }

    if (algorithmResult.converged) {
      logs.push(createLogEntry(`✨ Distance Vector network CONVERGED in ${algorithmResult.roundsCount} rounds (${algorithmResult.totalMessages} vector transmissions, ${algorithmResult.totalUpdates} updates).`, 'converged'));
      if (algorithmResult.pathFound) {
        logs.push(createLogEntry(`📍 Final shortest path [${algorithmResult.sourceId} → ${algorithmResult.destId}]: ${algorithmResult.path.join(' → ')} (Total Cost: ${algorithmResult.pathCost})`, 'converged'));
      }
    }
  } else if (algorithmResult.algorithm.includes('Link State')) {
    logs.push(createLogEntry(`🚀 Link State routing initiated for Source Router ${algorithmResult.sourceId}.`, 'info'));
    logs.push(createLogEntry(`📡 Flooded Link State Packets (LSPs). Synchronized global Link State Database (LSDB, ~${algorithmResult.floodingMessages} simulated messages).`, 'exchange'));
    logs.push(createLogEntry(`⚙️ Running Dijkstra's Algorithm on local LSDB.`, 'info'));

    if (algorithmResult.steps) {
      for (const step of algorithmResult.steps) {
        if (step.stepIndex === 0) {
          logs.push(createLogEntry(`Dijkstra Step 0: Source "${algorithmResult.sourceId}" permanently settled (Cost: 0).`, 'dijkstra'));
        } else {
          logs.push(createLogEntry(`Dijkstra Step ${step.stepIndex}: Router "${step.selectedNode}" settled with min distance ${step.selectedDist}.`, 'dijkstra'));
          if (step.relaxed && step.relaxed.length > 0) {
            for (const r of step.relaxed) {
              logs.push(createLogEntry(`  ↳ ${r.explanation}`, 'update'));
            }
          }
        }
      }
    }

    logs.push(createLogEntry(`✨ Shortest Path Tree finalized in ${algorithmResult.dijkstraSteps} steps with ${algorithmResult.totalRelaxations} distance relaxations.`, 'converged'));
    if (algorithmResult.pathFound) {
      logs.push(createLogEntry(`📍 Final shortest path [${algorithmResult.sourceId} → ${algorithmResult.destId}]: ${algorithmResult.path.join(' → ')} (Total Cost: ${algorithmResult.pathCost})`, 'converged'));
    }
  }

  return logs;
}
