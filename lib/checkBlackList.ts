// import blacklistData from '../blacklist.json';

// export function checkBlacklist(text: string) {
//   const violations: Record<string, string[]> = {};

//   const lowerText = text.toLowerCase();

//   for (const [category, words] of Object.entries(blacklistData.blacklist)) {
//     const found = words.filter((word) => {
//       const regex = new RegExp(`\\b${word.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}\\b`, 'iu');
//       return regex.test(lowerText);
//     });

//     if (found.length > 0) {
//       violations[category] = found;
//     }
//   }

//   return violations;
// }


import blacklistData from '../blacklist.json';

export function checkBlacklist(text: string) {
  const violations: string[] = [];  // Mảng chứa các từ vi phạm
  const lowerText = text.toLowerCase();

  // Duyệt qua tất cả các từ trong blacklist
  for (const words of Object.values(blacklistData.blacklist)) {
    const found = words.filter((word) => {
      const regex = new RegExp(`\\b${word.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}\\b`, 'iu');
      return regex.test(lowerText);
    });

    // Thêm các từ vi phạm vào mảng `violations`
    violations.push(...found);
  }

  return violations;
}
