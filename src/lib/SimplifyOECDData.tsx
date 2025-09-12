// type OECDObservation = {
//     [key: string]: [number, ...any[]];
//   };
  
//   interface OECDRawData {
//     dataSets: [
//       {
//         observations: OECDObservation;
//       }
//     ];
//   }
  
//   interface CountryMap {
//     [key: string]: string;
//   }
  
//   interface InstitutionMap {
//     [key: string]: string;
//   }
  
//   interface SimplifiedRecord {
//     country: string;
//     institution_type: string;
//     average_class_size: number;
//   }
  
//   export function simplifyOECDClassSizeData(
//     rawData: OECDRawData,
//     countryMap: CountryMap,
//     institutionMap: InstitutionMap
//   ): SimplifiedRecord[] {
//     if (
//       !rawData ||
//       !rawData.dataSets ||
//       !rawData.dataSets.observations
//     )
//       return [];
  
//     const simplifiedList: SimplifiedRecord[] = [];
  
//     Object.entries(rawData.dataSets.observations).forEach(
//       ([key, valueArray]) => {
//         const countryCode = key.slice(0, 3);
//         const institutionCode = key.slice(7, 8);
  
//         simplifiedList.push({
//           country: countryMap[countryCode] || countryCode,
//           institution_type: institutionMap[institutionCode] || institutionCode,
//           average_class_size: valueArray
//         });
//       }
//     );
  
//     return simplifiedList;
//   }
  