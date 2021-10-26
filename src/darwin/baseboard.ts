'use strict';

import * as os from 'os';
import { getValue, nextTick } from '../common';
import { execCmd } from '../common/exec';
import { initBaseboard } from '../common/initials';

export const darwinBaseboard = async () => {
  const result = initBaseboard;
  const workload = [];
  workload.push(execCmd('ioreg -c IOPlatformExpertDevice -d 2'));
  workload.push(execCmd('system_profiler SPMemoryDataType'));
  const data = await Promise.allSettled(workload);
  let lines = data[0] ? data[0].toString().replace(/[<>"]/g, '').split('\n') : [''];
  result.manufacturer = getValue(lines, 'manufacturer', '=', true);
  result.model = getValue(lines, 'model', '=', true);
  result.version = getValue(lines, 'version', '=', true);
  result.serial = getValue(lines, 'ioplatformserialnumber', '=', true);
  result.assetTag = getValue(lines, 'board-id', '=', true);

  // mem
  let devices = data[1] ? data[1].toString().split('        BANK ') : [''];
  if (devices.length === 1) {
    devices = data[1] ? data[1].toString().split('        DIMM') : [''];
  }
  devices.shift();
  result.memSlots = devices.length;

  if (os.arch() === 'arm64') {
    result.memSlots = 0;
    result.memMax = os.totalmem();
  }

  return result;
};

export const baseboard = async () => {
  await nextTick();
  return darwinBaseboard();
};

