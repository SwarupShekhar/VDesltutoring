import { useMemo } from 'react'

interface SEOStats {
    score: number
    checks: {
        id: string
        label: string
        status: 'success' | 'warning' | 'error'
        message: string
        value?: any
    }[]
}

export function useSEOHealth(content: string, metadata: {
    title: string
    metaDescription: string
    focalKeyword: string
    altText: string
}): SEOStats {
    return useMemo(() => {
        const checks: SEOStats['checks'] = []
        let score = 0
        const maxScore = 100

        // 1. Title Length Check
        const titleLen = metadata.title.length
        if (titleLen >= 50 && titleLen <= 60) {
            checks.push({ id: 'title-len', label: 'SEO Title Length', status: 'success', message: 'Perfect length for search results.', value: titleLen })
            score += 20
        } else if (titleLen > 0) {
            checks.push({ id: 'title-len', label: 'SEO Title Length', status: 'warning', message: 'Try to stay between 50-60 characters.', value: titleLen })
            score += 10
        } else {
            checks.push({ id: 'title-len', label: 'SEO Title Length', status: 'error', message: 'Add a title to improve visibility.', value: 0 })
        }

        // 2. Meta Description
        const descLen = metadata.metaDescription.length
        if (descLen >= 120 && descLen <= 160) {
            checks.push({ id: 'meta-desc', label: 'Meta Description', status: 'success', message: 'Optimal for click-through rates.', value: descLen })
            score += 20
        } else if (descLen > 0) {
            checks.push({ id: 'meta-desc', label: 'Meta Description', status: 'warning', message: 'Aim for 120-160 characters for best CTR.', value: descLen })
            score += 10
        } else {
            checks.push({ id: 'meta-desc', label: 'Meta Description', status: 'error', message: 'Missing meta description.', value: 0 })
        }

        // 3. Content Length
        const wordCount = content.trim() ? content.split(/\s+/).length : 0
        if (wordCount >= 300) {
            checks.push({ id: 'content-len', label: 'Content Length', status: 'success', message: 'Good depth for search engines.', value: wordCount })
            score += 20
        } else if (wordCount >= 100) {
            checks.push({ id: 'content-len', label: 'Content Length', status: 'warning', message: 'Try to reach at least 300 words for better ranking.', value: wordCount })
            score += 10
        } else {
            checks.push({ id: 'content-len', label: 'Content Length', status: 'error', message: 'Content is too short.', value: wordCount })
        }

        // 4. H1 Check
        const h1Count = (content.match(/^#\s/gm) || []).length
        if (h1Count === 1) {
            checks.push({ id: 'h1-check', label: 'Main Heading', status: 'success', message: 'Exactly one H1 found.' })
            score += 20
        } else if (h1Count > 1) {
            checks.push({ id: 'h1-check', label: 'Main Heading', status: 'error', message: 'Multiple H1 tags found. Use only one for SEO.' })
        } else {
            checks.push({ id: 'h1-check', label: 'Main Heading', status: 'error', message: 'Add one (and only one) H1 tag.' })
        }

        // 5. Image Alt Text
        const imgCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length
        if (imgCount > 0 && metadata.altText) {
             checks.push({ id: 'img-alt', label: 'Image Accessibility', status: 'success', message: 'Header image has alt text.' })
             score += 20
        } else if (imgCount > 0) {
            checks.push({ id: 'img-alt', label: 'Image Accessibility', status: 'warning', message: 'Header image needs better alt text.' })
            score += 10
        } else {
             // If no images, we just pass this with neutral or ignore
             score += 20
        }

        // 6. Keyword Density
        if (metadata.focalKeyword && wordCount > 0) {
            const keywordRegex = new RegExp(`\\b${metadata.focalKeyword}\\b`, 'gi')
            const keywordCount = (content.match(keywordRegex) || []).length
            const density = (keywordCount / wordCount) * 100
            
            if (density >= 0.5 && density <= 2.5) {
                checks.push({ id: 'keyword-density', label: 'Keyword Density', status: 'success', message: `Good density (${density.toFixed(1)}%).`, value: density })
                score += 10
            } else if (density > 0) {
                checks.push({ id: 'keyword-density', label: 'Keyword Density', status: 'warning', message: `Density is ${density > 2.5 ? 'too high' : 'too low'} (${density.toFixed(1)}%).`, value: density })
                score += 5
            } else {
                checks.push({ id: 'keyword-density', label: 'Keyword Density', status: 'error', message: 'Focal keyword not found in content.', value: 0 })
            }
        } else if (metadata.focalKeyword) {
            checks.push({ id: 'keyword-density', label: 'Keyword Density', status: 'error', message: 'Add content to check keyword density.', value: 0 })
        }

        // 7. Internal & External Links
        const links = content.match(/\[.*?\]\((.*?)\)/g) || []
        const internalLinks = links.filter(l => l.includes('englivo.com') || l.includes('](') && l.match(/\]\(\//)).length
        const totalLinks = links.length
        const externalLinks = totalLinks - internalLinks

        if (internalLinks > 0) {
            checks.push({ id: 'links-internal', label: 'Internal Links', status: 'success', message: `Found ${internalLinks} internal links.`, value: internalLinks })
            score += 10
        } else {
            checks.push({ id: 'links-internal', label: 'Internal Links', status: 'warning', message: 'Add internal links to boost authority.' })
        }

        if (externalLinks > 0) {
            checks.push({ id: 'links-external', label: 'External Links', status: 'success', message: `Found ${externalLinks} external links.`, value: externalLinks })
            score += 5
        }

        // 8. Readability (Flesch-Kincaid basic)
        const readability = calculateReadability(content)
        if (readability.score >= 60) {
             checks.push({ id: 'readability', label: 'Readability', status: 'success', message: `Score: ${readability.score.toFixed(1)} (${readability.level}). Excellent for general audiences.`, value: readability.score })
             score += 15
        } else if (readability.score >= 30) {
             checks.push({ id: 'readability', label: 'Readability', status: 'warning', message: `Score: ${readability.score.toFixed(1)} (${readability.level}). May be difficult for some readers.`, value: readability.score })
             score += 10
        } else if (wordCount > 50) {
             checks.push({ id: 'readability', label: 'Readability', status: 'error', message: `Score: ${readability.score.toFixed(1)} (${readability.level}). Content is very complex.`, value: readability.score })
        }

        // Normalize score to 100
        const totalAvailableScore = metadata.focalKeyword ? 140 : 125 // Adjusted for readability points
        const normalizedScore = Math.min(100, Math.round((score / totalAvailableScore) * 100))

        return { score: normalizedScore, checks }
    }, [content, metadata])
}

function calculateReadability(text: string) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0)
    // Improved sentence detection: Don't split after common abbreviations
    const sentences = text.split(/(?<!\b(?:Mr|Ms|Dr|i\.e|e\.g|etc|prof|jr|sr))\b[.!?]+(?:\s+|$)/i)
        .filter(s => s.trim().length > 0)
    
    if (words.length < 10) return { score: 100, level: 'N/A' }
    
    const syllableCount = words.reduce((acc, word) => acc + countSyllables(word), 0)
    
    // Flesch Reading Ease
    const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllableCount / words.length)
    
    let level = 'Extremely Difficult'
    if (score >= 90) level = 'Very Easy'
    else if (score >= 80) level = 'Easy'
    else if (score >= 70) level = 'Fairly Easy'
    else if (score >= 60) level = 'Standard'
    else if (score >= 50) level = 'Fairly Difficult'
    else if (score >= 30) level = 'Difficult'
    
    return { score: Math.max(0, Math.min(100, score)), level }
}

function countSyllables(word: string) {
    word = word.toLowerCase().replace(/[^a-z]/g, '')
    if (word.length <= 3) return 1
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    const syllables = word.match(/[aeiouy]{1,2}/g)
    return syllables ? syllables.length : 1
}
