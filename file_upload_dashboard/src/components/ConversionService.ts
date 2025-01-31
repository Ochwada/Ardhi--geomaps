// components/ConversionService.ts

'use client';

import { useState } from 'react';
import * as mapshaper from 'mapshaper';

const convertWithMapShaper = async (geojsonContent: any) => {
  try {
    // Convert the input data to a string format that mapshaper can understand
    const inputString = JSON.stringify(geojsonContent);

    // Perform conversion and simplification using MapShaper
    return new Promise((resolve, reject) => {
      mapshaper.process(inputString, (result: any) => {
        if (result.error) {
          reject(result.error);
        } else {
          resolve(JSON.parse(result.output));
        }
      });
    });
  } catch (error) {
    throw error;
  }
};

export { convertWithMapShaper };
