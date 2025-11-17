#!/usr/bin/env node

/**
 * 智能文档搜索系统
 * 提供语义搜索、个性化推荐和交互式查询功能
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class IntelligentSearch {
  constructor() {
    this.config = this.loadConfig();
    this.index = this.loadIndex();
    this.userProfiles = this.loadUserProfiles();
  }

  loadConfig() {
    return {
      // 搜索配置
      search: {
        indexFile: '.doc-search-index.json',
        maxResults: 20,
        minScore: 0.1,
        fuzzyMatch: true,
        semanticSearch: true
      },

      // 索引配置
      indexing: {
        includePatterns: [
          'docs/**/*.md',
          'README.md',
          '!docs/reports/**',
          '!docs/generated/**'
        ],
        excludePatterns: [
          'node_modules/**',
          '.git/**',
          '*.log'
        ],
        updateInterval: 3600000 // 1小时
      },

      // 个性化配置
      personalization: {
        profileFile: '.user-search-profiles.json',
        learningRate: 0.1,
        maxHistory: 100
      },

      // 推荐配置
      recommendation: {
        collaborativeFiltering: true,
        contentBased: true,
        popularityBased: true,
        weights: {
          collaborative: 0.4,
          contentBased: 0.4,
          popularity: 0.2
        }
      }
    };
  }

  loadIndex() {
    try {
      const indexPath = this.config.search.indexFile;
      if (fs.existsSync(indexPath)) {
        const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        // 检查索引是否过期
        if (Date.now() - indexData.timestamp > this.config.indexing.updateInterval) {
          console.log('📅 索引已过期，重新构建...');
          return this.buildIndex();
        }
        return indexData;
      }
    } catch (error) {
      console.warn('⚠️ 加载索引失败:', error.message);
    }

    console.log('🏗️ 构建文档索引...');
    return this.buildIndex();
  }

  loadUserProfiles() {
    try {
      const profilePath = this.config.personalization.profileFile;
      if (fs.existsSync(profilePath)) {
        return JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
      }
    } catch (error) {
      console.warn('⚠️ 加载用户配置失败:', error.message);
    }
    return {};
  }

  saveIndex() {
    try {
      const indexData = {
        ...this.index,
        timestamp: Date.now()
      };
      fs.writeFileSync(this.config.search.indexFile, JSON.stringify(indexData, null, 2));
    } catch (error) {
      console.error('❌ 保存索引失败:', error.message);
    }
  }

  saveUserProfiles() {
    try {
      fs.writeFileSync(this.config.personalization.profileFile, JSON.stringify(this.userProfiles, null, 2));
    } catch (error) {
      console.error('❌ 保存用户配置失败:', error.message);
    }
  }

  /**
   * 构建文档索引
   */
  buildIndex() {
    const index = {
      documents: [],
      terms: {},
      invertedIndex: {},
      metadata: {
        totalDocs: 0,
        totalTerms: 0,
        lastUpdated: new Date().toISOString()
      }
    };

    // 扫描文档文件
    const docFiles = this.scanDocuments();
    console.log(`📄 发现 ${docFiles.length} 个文档文件`);

    docFiles.forEach((filePath, docId) => {
      const doc = this.indexDocument(filePath, docId);
      if (doc) {
        index.documents.push(doc);
        this.addToInvertedIndex(index.invertedIndex, doc);
      }
    });

    index.metadata.totalDocs = index.documents.length;
    index.metadata.totalTerms = Object.keys(index.terms).length;

    console.log(`✅ 索引构建完成: ${index.metadata.totalDocs} 文档, ${index.metadata.totalTerms} 词条`);
    return index;
  }

  /**
   * 扫描文档文件
   */
  scanDocuments() {
    const files = [];

    function scanDir(dir) {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !this.shouldExclude(fullPath)) {
          scanDir.call(this, fullPath);
        } else if (stat.isFile() && this.shouldInclude(fullPath)) {
          files.push(fullPath);
        }
      }
    }

    scanDir.call(this, '.');

    return files;
  }

  /**
   * 判断是否应该包含文件
   */
  shouldInclude(filePath) {
    // 检查包含模式
    const includeMatch = this.config.indexing.includePatterns.some(pattern =>
      this.matchPattern(filePath, pattern)
    );

    if (!includeMatch) return false;

    // 检查排除模式
    const excludeMatch = this.config.indexing.excludePatterns.some(pattern =>
      this.matchPattern(filePath, pattern)
    );

    return !excludeMatch;
  }

  /**
   * 判断是否应该排除路径
   */
  shouldExclude(filePath) {
    return this.config.indexing.excludePatterns.some(pattern =>
      this.matchPattern(filePath, pattern)
    );
  }

  /**
   * 匹配模式（简化版）
   */
  matchPattern(filePath, pattern) {
    const regex = new RegExp(pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
      .replace(/\//g, '\\/')
    );
    return regex.test(filePath);
  }

  /**
   * 索引单个文档
   */
  indexDocument(filePath, docId) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const metadata = this.extractMetadata(content, filePath);

      // 分词和处理
      const tokens = this.tokenize(content);
      const termFreq = this.calculateTermFrequency(tokens);

      const doc = {
        id: docId,
        path: filePath,
        title: metadata.title,
        category: metadata.category,
        tags: metadata.tags,
        summary: metadata.summary,
        tokens: tokens,
        termFreq: termFreq,
        hash: this.getFileHash(content),
        indexedAt: new Date().toISOString()
      };

      return doc;

    } catch (error) {
      console.warn(`⚠️ 索引文档失败 ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * 提取文档元数据
   */
  extractMetadata(content, filePath) {
    const lines = content.split('\n');
    const metadata = {
      title: path.basename(filePath, '.md'),
      category: 'general',
      tags: [],
      summary: ''
    };

    // 提取标题
    for (const line of lines.slice(0, 10)) {
      if (line.startsWith('# ')) {
        metadata.title = line.substring(2).trim();
        break;
      }
    }

    // 提取分类和标签
    const categoryMatch = content.match(/分类[：:]\s*(\w+)/);
    if (categoryMatch) {
      metadata.category = categoryMatch[1];
    }

    const tagsMatch = content.match(/标签[：:]\s*([^\n]+)/);
    if (tagsMatch) {
      metadata.tags = tagsMatch[1].split(',').map(tag => tag.trim());
    }

    // 提取摘要
    const summaryMatch = content.match(/## 概述|## 介绍|## 摘要/);
    if (summaryMatch) {
      const startIndex = content.indexOf(summaryMatch[0]);
      const endIndex = content.indexOf('\n##', startIndex + 1);
      const summarySection = content.substring(startIndex, endIndex > 0 ? endIndex : startIndex + 500);
      metadata.summary = summarySection.replace(/^##.*$/gm, '').trim().substring(0, 200);
    }

    return metadata;
  }

  /**
   * 分词处理
   */
  tokenize(content) {
    // 简单的中文分词（实际项目中应使用专业分词库）
    const tokens = content
      .toLowerCase()
      // 移除代码块
      .replace(/```[\s\S]*?```/g, '')
      // 移除内联代码
      .replace(/`[^`]*`/g, '')
      // 移除Markdown标记
      .replace(/[#*`~\[\]]/g, '')
      // 分词（简单按空格和标点分割）
      .split(/[\s,.!?;:()""''【】《》""''——……]/)
      .filter(token => token.length > 1 && !/^\d+$/.test(token))
      .map(token => token.trim())
      .filter(token => token);

    return [...new Set(tokens)]; // 去重
  }

  /**
   * 计算词频
   */
  calculateTermFrequency(tokens) {
    const freq = {};
    tokens.forEach(token => {
      freq[token] = (freq[token] || 0) + 1;
    });
    return freq;
  }

  /**
   * 添加到倒排索引
   */
  addToInvertedIndex(invertedIndex, doc) {
    doc.tokens.forEach(token => {
      if (!invertedIndex[token]) {
        invertedIndex[token] = [];
      }
      if (Array.isArray(invertedIndex[token])) {
        invertedIndex[token].push({
          docId: doc.id,
          frequency: doc.termFreq[token] || 1
        });
      }
    });
  }

  /**
   * 获取文件哈希
   */
  getFileHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * 执行搜索
   */
  async search(query, options = {}) {
    const {
      userId,
      limit = this.config.search.maxResults,
      personalized = true,
      includeRecommendations = true
    } = options;

    console.log(`🔍 搜索: "${query}"`);

    // 分词查询
    const queryTokens = this.tokenize(query);

    // 执行基础搜索
    const searchResults = this.performSearch(queryTokens);

    // 个性化排序
    let results = searchResults;
    if (personalized && userId) {
      results = this.personalizeResults(searchResults, userId);
    }

    // 限制结果数量
    results = results.slice(0, limit);

    // 生成推荐
    let recommendations = [];
    if (includeRecommendations) {
      recommendations = await this.generateRecommendations(query, results, userId);
    }

    // 记录用户搜索历史
    if (userId) {
      this.recordUserSearch(userId, query, results);
    }

    return {
      query,
      results,
      recommendations,
      totalFound: searchResults.length,
      searchTime: Date.now()
    };
  }

  /**
   * 执行基础搜索
   */
  performSearch(queryTokens) {
    const results = [];

    // 为每个查询词项找到相关文档
    const relevantDocs = new Map();

    queryTokens.forEach(token => {
      const postings = this.index.invertedIndex[token];
      if (postings) {
        postings.forEach(posting => {
          const docId = posting.docId;
          const doc = this.index.documents[docId];

          if (!relevantDocs.has(docId)) {
            relevantDocs.set(docId, {
              doc,
              score: 0,
              matchedTerms: []
            });
          }

          const docData = relevantDocs.get(docId);
          docData.score += this.calculateScore(token, posting, doc);
          docData.matchedTerms.push(token);
        });
      }
    });

    // 转换为结果数组并排序
    relevantDocs.forEach(docData => {
      if (docData.score >= this.config.search.minScore) {
        results.push({
          document: docData.doc,
          score: docData.score,
          matchedTerms: docData.matchedTerms,
          highlights: this.generateHighlights(docData.doc, docData.matchedTerms)
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 计算文档相关性分数
   */
  calculateScore(token, posting, doc) {
    const tf = posting.frequency; // 词频
    const df = this.index.invertedIndex[token].length; // 文档频率
    const totalDocs = this.index.metadata.totalDocs;

    // TF-IDF计算
    const tfidf = tf * Math.log(totalDocs / df);

    // 位置权重（标题匹配权重更高）
    let positionWeight = 1;
    if (doc.title.toLowerCase().includes(token)) {
      positionWeight = 2;
    }

    return tfidf * positionWeight;
  }

  /**
   * 生成高亮片段
   */
  generateHighlights(doc, matchedTerms) {
    try {
      const content = fs.readFileSync(doc.path, 'utf-8');
      const highlights = [];

      matchedTerms.forEach(term => {
        const regex = new RegExp(`(.{0,50})(${term})(.{0,50})`, 'gi');
        let match;
        while ((match = regex.exec(content)) !== null && highlights.length < 3) {
          highlights.push({
            text: `...${match[1]}**${match[2]}**${match[3]}...`,
            term: term
          });
        }
      });

      return highlights;
    } catch (error) {
      return [];
    }
  }

  /**
   * 个性化结果排序
   */
  personalizeResults(results, userId) {
    const userProfile = this.userProfiles[userId];
    if (!userProfile) return results;

    // 根据用户偏好调整分数
    return results.map(result => {
      let personalizedScore = result.score;

      // 类别偏好
      const categoryPreference = userProfile.categoryPreferences?.[result.document.category] || 1;
      personalizedScore *= categoryPreference;

      // 标签偏好
      result.document.tags.forEach(tag => {
        const tagPreference = userProfile.tagPreferences?.[tag] || 1;
        personalizedScore *= tagPreference;
      });

      return {
        ...result,
        score: personalizedScore,
        personalized: true
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * 生成推荐内容
   */
  async generateRecommendations(query, searchResults, userId) {
    const recommendations = [];

    // 基于内容的推荐
    if (this.config.recommendation.contentBased) {
      const contentBased = this.getContentBasedRecommendations(searchResults);
      recommendations.push(...contentBased.map(rec => ({ ...rec, type: 'content-based' })));
    }

    // 基于协同过滤的推荐
    if (this.config.recommendation.collaborativeFiltering && userId) {
      const collaborative = this.getCollaborativeRecommendations(userId, searchResults);
      recommendations.push(...collaborative.map(rec => ({ ...rec, type: 'collaborative' })));
    }

    // 基于流行度的推荐
    if (this.config.recommendation.popularityBased) {
      const popularity = this.getPopularityBasedRecommendations();
      recommendations.push(...popularity.map(rec => ({ ...rec, type: 'popularity' })));
    }

    // 去重并排序
    const uniqueRecommendations = this.deduplicateRecommendations(recommendations);
    return uniqueRecommendations.slice(0, 5);
  }

  /**
   * 基于内容的推荐
   */
  getContentBasedRecommendations(searchResults) {
    const recommendations = [];
    const categories = new Set();
    const tags = new Set();

    // 收集搜索结果的类别和标签
    searchResults.forEach(result => {
      categories.add(result.document.category);
      result.document.tags.forEach(tag => tags.add(tag));
    });

    // 寻找相似文档
    this.index.documents.forEach(doc => {
      if (searchResults.some(r => r.document.id === doc.id)) return;

      let similarity = 0;

      // 类别相似度
      if (categories.has(doc.category)) similarity += 0.3;

      // 标签相似度
      const tagOverlap = doc.tags.filter(tag => tags.has(tag)).length;
      similarity += (tagOverlap / Math.max(doc.tags.length, 1)) * 0.4;

      if (similarity > 0.2) {
        recommendations.push({
          document: doc,
          score: similarity,
          reason: '相似内容'
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * 协同过滤推荐
   */
  getCollaborativeRecommendations(userId, searchResults) {
    const userProfile = this.userProfiles[userId];
    if (!userProfile?.searchHistory) return [];

    const recommendations = [];
    const viewedDocIds = new Set(userProfile.searchHistory.flatMap(h => h.resultIds));

    // 寻找其他用户也查看过的文档
    Object.values(this.userProfiles).forEach(profile => {
      if (profile.id === userId) return;

      const otherViewed = new Set(profile.searchHistory?.flatMap(h => h.resultIds) || []);
      const overlap = new Set([...viewedDocIds].filter(id => otherViewed.has(id)));

      if (overlap.size > 0) {
        // 推荐这个用户查看但当前用户未查看的文档
        profile.searchHistory?.forEach(history => {
          history.resultIds.forEach(docId => {
            if (!viewedDocIds.has(docId)) {
              const doc = this.index.documents[docId];
              if (doc) {
                recommendations.push({
                  document: doc,
                  score: overlap.size / viewedDocIds.size,
                  reason: '其他用户也感兴趣'
                });
              }
            }
          });
        });
      }
    });

    return recommendations;
  }

  /**
   * 基于流行度的推荐
   */
  getPopularityBasedRecommendations() {
    // 简单的流行度计算（实际项目中可以基于访问统计）
    const popularityScores = {};

    Object.values(this.userProfiles).forEach(profile => {
      profile.searchHistory?.forEach(history => {
        history.resultIds.forEach(docId => {
          popularityScores[docId] = (popularityScores[docId] || 0) + 1;
        });
      });
    });

    const recommendations = Object.entries(popularityScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([docId, score]) => ({
        document: this.index.documents[docId],
        score: score / Math.max(...Object.values(popularityScores)),
        reason: '热门内容'
      }));

    return recommendations;
  }

  /**
   * 去重推荐结果
   */
  deduplicateRecommendations(recommendations) {
    const seen = new Set();
    return recommendations.filter(rec => {
      const key = rec.document.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * 记录用户搜索历史
   */
  recordUserSearch(userId, query, results) {
    if (!this.userProfiles[userId]) {
      this.userProfiles[userId] = {
        id: userId,
        searchHistory: [],
        categoryPreferences: {},
        tagPreferences: {}
      };
    }

    const userProfile = this.userProfiles[userId];

    // 添加搜索记录
    userProfile.searchHistory.unshift({
      query,
      resultIds: results.slice(0, 10).map(r => r.document.id),
      timestamp: new Date().toISOString()
    });

    // 限制历史记录数量
    if (userProfile.searchHistory.length > this.config.personalization.maxHistory) {
      userProfile.searchHistory = userProfile.searchHistory.slice(0, this.config.personalization.maxHistory);
    }

    // 更新偏好
    this.updateUserPreferences(userProfile, results);

    this.saveUserProfiles();
  }

  /**
   * 更新用户偏好
   */
  updateUserPreferences(userProfile, results) {
    const learningRate = this.config.personalization.learningRate;

    results.forEach(result => {
      const doc = result.document;

      // 更新类别偏好
      if (!userProfile.categoryPreferences[doc.category]) {
        userProfile.categoryPreferences[doc.category] = 1;
      } else {
        userProfile.categoryPreferences[doc.category] += learningRate;
      }

      // 更新标签偏好
      doc.tags.forEach(tag => {
        if (!userProfile.tagPreferences[tag]) {
          userProfile.tagPreferences[tag] = 1;
        } else {
          userProfile.tagPreferences[tag] += learningRate;
        }
      });
    });
  }

  /**
   * 获取搜索建议
   */
  getSearchSuggestions(query, userId) {
    const suggestions = [];

    // 基于用户历史的建议
    if (userId && this.userProfiles[userId]) {
      const history = this.userProfiles[userId].searchHistory || [];
      const recentQueries = history.slice(0, 5).map(h => h.query);

      suggestions.push(...recentQueries.filter(q =>
        q.toLowerCase().includes(query.toLowerCase()) && q !== query
      ));
    }

    // 基于流行查询的建议
    const popularQueries = this.getPopularQueries();
    suggestions.push(...popularQueries.filter(q =>
      q.toLowerCase().includes(query.toLowerCase()) && !suggestions.includes(q)
    ));

    return [...new Set(suggestions)].slice(0, 5);
  }

  /**
   * 获取流行查询
   */
  getPopularQueries() {
    const queryCounts = {};

    Object.values(this.userProfiles).forEach(profile => {
      profile.searchHistory?.forEach(history => {
        queryCounts[history.query] = (queryCounts[history.query] || 0) + 1;
      });
    });

    return Object.entries(queryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query]) => query);
  }

  /**
   * 重新构建索引
   */
  async rebuildIndex() {
    console.log('🔄 重新构建搜索索引...');
    this.index = this.buildIndex();
    this.saveIndex();
    console.log('✅ 索引重建完成');
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const userCount = Object.keys(this.userProfiles).length;
    const totalSearches = Object.values(this.userProfiles)
      .reduce((sum, profile) => sum + (profile.searchHistory?.length || 0), 0);

    return {
      index: {
        documents: this.index.metadata.totalDocs,
        terms: this.index.metadata.totalTerms,
        lastUpdated: this.index.metadata.lastUpdated
      },
      users: {
        count: userCount,
        totalSearches: totalSearches,
        averageSearchesPerUser: userCount > 0 ? totalSearches / userCount : 0
      }
    };
  }
}

// CLI接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const search = new IntelligentSearch();

  switch (command) {
    case 'search':
      const query = args[1];
      const userId = args.find((arg, i) => arg === '--user' && args[i + 1])?.[args.indexOf('--user') + 1];
      search.search(query, { userId }).then(results => {
        console.log('\n📊 搜索结果:');
        console.log('='.repeat(50));
        results.results.forEach((result, i) => {
          console.log(`${i + 1}. ${result.document.title}`);
          console.log(`   📄 ${result.document.path}`);
          console.log(`   🎯 匹配度: ${(result.score * 100).toFixed(1)}%`);
          console.log(`   🏷️ 标签: ${result.document.tags.join(', ')}`);
          if (result.highlights.length > 0) {
            console.log(`   💡 ${result.highlights[0].text}`);
          }
          console.log('');
        });

        if (results.recommendations.length > 0) {
          console.log('💡 推荐内容:');
          results.recommendations.forEach((rec, i) => {
            console.log(`${i + 1}. ${rec.document.title} (${rec.type})`);
          });
        }
      });
      break;

    case 'rebuild':
      search.rebuildIndex();
      break;

    case 'stats':
      const stats = search.getStats();
      console.log('📊 搜索系统统计:');
      console.log(JSON.stringify(stats, null, 2));
      break;

    case 'suggest':
      const partialQuery = args[1];
      const suggestions = search.getSearchSuggestions(partialQuery);
      console.log('💡 搜索建议:');
      suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
      break;

    default:
      console.log(`
智能搜索系统使用帮助：

用法: node intelligent-search.js <command> [options]

命令:
  search <query> [--user <userId>]     执行搜索
  rebuild                               重新构建索引
  stats                                 显示统计信息
  suggest <partial-query>              获取搜索建议

示例:
  node intelligent-search.js search "API文档"
  node intelligent-search.js search "组件" --user developer1
  node intelligent-search.js rebuild
  node intelligent-search.js stats
  node intelligent-search.js suggest "前端"
      `);
  }
}

module.exports = IntelligentSearch;
