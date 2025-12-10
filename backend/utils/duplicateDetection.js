const { normalizeEmail, normalizePhone, normalizeName } = require('./validators');

// Calculate string similarity using Levenshtein distance
const levenshteinDistance = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array.from({ length: len2 + 1 }, () => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[len2][len1];
};

const calculateStringSimilarity = (str1, str2) => {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
};

const detectDuplicates = (name, email, phone, existingLeads) => {
  const normalizedName = normalizeName(name);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  const matches = [];

  for (const lead of existingLeads) {
    const existingNormalizedName = normalizeName(lead.name);
    const existingNormalizedEmail = normalizeEmail(lead.email);
    const existingNormalizedPhone = normalizePhone(lead.phone);

    let confidence = 0;
    let matchedFields = [];

    // Email matching (40% weight)
    if (normalizedEmail === existingNormalizedEmail) {
      confidence += 40;
      matchedFields.push('email');
    } else {
      const emailSimilarity = calculateStringSimilarity(normalizedEmail, existingNormalizedEmail);
      if (emailSimilarity > 0.8) {
        confidence += emailSimilarity * 40;
        matchedFields.push('email (similar)');
      }
    }

    // Phone matching (35% weight)
    if (normalizedPhone === existingNormalizedPhone) {
      confidence += 35;
      matchedFields.push('phone');
    } else {
      const phoneSimilarity = calculateStringSimilarity(normalizedPhone, existingNormalizedPhone);
      if (phoneSimilarity > 0.9) {
        confidence += phoneSimilarity * 35;
        matchedFields.push('phone (similar)');
      }
    }

    // Name matching (25% weight)
    const nameSimilarity = calculateStringSimilarity(normalizedName, existingNormalizedName);
    if (nameSimilarity > 0.85) {
      confidence += nameSimilarity * 25;
      matchedFields.push('name');
    }

    if (confidence >= 50) {
      matches.push({
        lead,
        confidence: Math.round(confidence),
        matchedFields,
      });
    }
  }

  // Sort by confidence descending
  matches.sort((a, b) => b.confidence - a.confidence);

  return {
    isDuplicate: matches.length > 0,
    matches: matches.map(m => ({
      id: m.lead.id,
      name: m.lead.name,
      email: m.lead.email,
      phone: m.lead.phone,
      status: m.lead.status,
      source: m.lead.source,
      confidence: m.confidence,
      matchedFields: m.matchedFields,
    })),
    confidence: matches.length > 0 ? matches[0].confidence : 0,
  };
};

module.exports = {
  detectDuplicates,
};
