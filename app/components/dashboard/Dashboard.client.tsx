import React, { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { BaseDashboard } from './BaseDashboard';
import { webcontainer } from '~/lib/webcontainer';
import { getLanguageFromExtension } from '~/utils/getLanguageFromExtension';
import { path } from '~/utils/path';
import { toast } from 'react-toastify';
import { workbenchStore } from '~/lib/stores/workbench';
import { WORK_DIR } from '~/utils/constants';

interface LanguageDistribution {
  language: string;
  count: number;
}

interface DashboardData {
  totalFiles: number;
  totalModules: number;
  languagesDetected: number;
  codeHealthScore: number;
  languageDistribution: LanguageDistribution[];
  recentChanges: string[];
  dependencies: string[];
  fileStructure: string[];
  potentialIssues: string[];
  architectureLayers: string[];
  totalLines: number;
  totalCodeLines: number;
  totalCommentLines: number;
  totalBlankLines: number;
}

interface DashboardState {
  loading: boolean;
  data: DashboardData;
}

export function Dashboard() {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    loading: false,
    data: {
      totalFiles: 0,
      totalModules: 0,
      languagesDetected: 0,
      codeHealthScore: 0,
      languageDistribution: [],
      recentChanges: [],
      dependencies: [],
      fileStructure: [],
      potentialIssues: [],
      architectureLayers: [],
      totalLines: 0,
      totalCodeLines: 0,
      totalCommentLines: 0,
      totalBlankLines: 0
    }
  });
  
  const setDashboardData = (data: DashboardData) => {
    setDashboardState(prev => ({
      ...prev,
      data
    }));
  };
  
  const { data: dashboardData, loading } = dashboardState;
  
  const loadDashboardData = async () => {
    setDashboardState(prev => ({ ...prev, loading: true }));
    
    try {
      const container = await webcontainer;
      
      async function getAllFiles(dirPath: string): Promise<{ path: string; content: string }[]> {
        const files: { path: string; content: string }[] = [];
        const entries = await container.fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          if (
            entry.isDirectory() &&
            (entry.name === 'node_modules' ||
              entry.name === '.git' ||
              entry.name === 'dist' ||
              entry.name === 'build' ||
              entry.name === '.cache' ||
              entry.name === '.next')
          ) {
            continue;
          }
          
          if (entry.isFile()) {
            if (entry.name.endsWith('.DS_Store') || entry.name.endsWith('.log') || entry.name.startsWith('.env')) {
              continue;
            }
            
            try {
              const content = await container.fs.readFile(fullPath, 'utf-8');
              files.push({ path: fullPath, content: content as string });
            } catch (error) {
              continue;
            }
          } else if (entry.isDirectory()) {
            const subFiles = await getAllFiles(fullPath);
            files.push(...subFiles);
          }
        }
        
        return files;
      };
      
      const allFiles = await getAllFiles(WORK_DIR);
      
      const totalFiles = allFiles.length;
      
      const languageCount: Record<string, number> = {};
      allFiles.forEach(file => {
        const ext = path.extname(file.path).toLowerCase();
        if (ext) {
          const language = getLanguageFromExtension(ext);
          if (language) {
            languageCount[language] = (languageCount[language] || 0) + 1;
          }
        }
      });
      
      const languagesDetected = Object.keys(languageCount).length;
      
      let totalLines = 0;
      let totalCodeLines = 0;
      let totalCommentLines = 0;
      let totalBlankLines = 0;
      
      allFiles.forEach(file => {
        const lines = file.content.split('\n');
        totalLines += lines.length;
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === '') {
            totalBlankLines++;
          } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/') || trimmed.startsWith('#')) {
            totalCommentLines++;
          } else {
            totalCodeLines++;
          }
        }
      });
      
      const codeToCommentRatio = totalCommentLines > 0 ? totalCodeLines / totalCommentLines : totalCodeLines;
      const blankLineRatio = totalBlankLines / totalLines;
      
      let codeHealthScore = 100;
      
      if (blankLineRatio > 0.3) {
        codeHealthScore -= (blankLineRatio - 0.3) * 100;
      }
      
      if (totalCommentLines > 0) {
        codeHealthScore += Math.min(20, totalCommentLines / Math.max(1, totalFiles));
      }
      
      codeHealthScore = Math.max(0, Math.min(100, Math.round(codeHealthScore)));
      
      const totalModules = allFiles.filter(file => {
        const lines = file.content.split('\n');
        return lines.some(line => line.trim() !== '' && !line.trim().startsWith('//'));
      }).length;
      
      const dependencies: string[] = [];
      const potentialIssues: string[] = [];
      const architectureLayers: string[] = [];
      const fileStructure: string[] = [];
      
      const packageJsonFile = allFiles.find(file => file.path.includes('package.json'));
      if (packageJsonFile) {
        try {
          const packageJson = JSON.parse(packageJsonFile.content);
          if (packageJson.dependencies) {
            dependencies.push(...Object.keys(packageJson.dependencies));
          }
          if (packageJson.devDependencies) {
            dependencies.push(...Object.keys(packageJson.devDependencies));
          }
        } catch (e) {
          console.error('Error parsing package.json:', e);
        }
      }
      
      allFiles.forEach(file => {
        fileStructure.push(file.path);
        
        if (file.path.includes('node_modules')) {
          return;
        }
        
        const ext = path.extname(file.path).toLowerCase();
        
        if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
          if (file.content.includes('TODO')) {
            potentialIssues.push(`TODO found in ${file.path}`);
          }
          if (file.content.includes('FIXME')) {
            potentialIssues.push(`FIXME found in ${file.path}`);
          }
          if (file.content.includes('HACK')) {
            potentialIssues.push(`HACK found in ${file.path}`);
          }
          if (file.content.includes('XXX')) {
            potentialIssues.push(`XXX found in ${file.path}`);
          }
          if (file.content.includes('BUG')) {
            potentialIssues.push(`BUG found in ${file.path}`);
          }
          
          const dirParts = file.path.split('/').filter(part => part !== '');
          if (dirParts.length > 1) {
            const layer = dirParts[1];
            if (!architectureLayers.includes(layer) && 
                !['node_modules', 'dist', 'build', 'public', 'assets', 'images', 'icons'].includes(layer)) {
              architectureLayers.push(layer);
            }
          }
          
          const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
          let match;
          while ((match = importRegex.exec(file.content)) !== null) {
            const importPath = match[1];
            if (importPath.startsWith('~/') || importPath.startsWith('@/')) {
              if (!dependencies.includes('internal:' + importPath)) {
                dependencies.push('internal:' + importPath);
              }
            } else if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
              if (!dependencies.includes(importPath)) {
                dependencies.push(importPath);
              }
            }
          }
        }
      });
      
      setDashboardData({
        totalFiles,
        totalModules,
        languagesDetected,
        codeHealthScore,
        languageDistribution: Object.entries(languageCount).map(([lang, count]) => ({ language: lang, count })),
        recentChanges: [],
        dependencies,
        fileStructure,
        potentialIssues,
        architectureLayers,
        totalLines,
        totalCodeLines,
        totalCommentLines,
        totalBlankLines
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  };
  
  useEffect(() => {
    workbenchStore.loadWorkspaceState();
    loadDashboardData();
    
    // Subscribe to file changes to update dashboard when files change
    const unsubscribe = workbenchStore.files.subscribe(() => {
      // Debounce the dashboard update to avoid excessive updates
      const timer = setTimeout(() => {
        loadDashboardData();
      }, 500); // 500ms debounce to avoid excessive updates
      
      // Cleanup the timer if new changes come in
      return () => clearTimeout(timer);
    });
    
    return () => {
      unsubscribe?.();
    };
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    if (score >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };
  
  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">
      {/* Hero Section */}
      <div className="relative mb-8 p-8 bg-gradient-to-br from-mindvex-elements-background-depth-2 to-mindvex-elements-background-depth-3 rounded-2xl border border-mindvex-elements-borderColor overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-mindvex-elements-textPrimary mb-3 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Project Dashboard
          </h1>
          <p className="text-lg text-mindvex-elements-textSecondary mb-6">Real-time codebase intelligence and architecture visualization</p>
          <button
            onClick={() => loadDashboardData()}
            disabled={loading}
            className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Workspace...
                </>
              ) : (
                <>
                  🔄 Refresh Analysis
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Metrics Grid with Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Files', value: dashboardData.totalFiles, icon: '📄', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500' },
            { label: 'Code Modules', value: dashboardData.totalModules, icon: '📦', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500' },
            { label: 'Languages', value: dashboardData.languagesDetected, icon: '🔤', color: 'from-green-500 to-green-600', bgColor: 'bg-green-500' },
            { label: 'Health Score', value: `${dashboardData.codeHealthScore}%`, icon: '💚', color: getHealthColor(dashboardData.codeHealthScore), bgColor: 'bg-orange-500', subtitle: getHealthLabel(dashboardData.codeHealthScore) }
          ].map((metric, idx) => (
            <div key={idx} className="group relative bg-mindvex-elements-background-depth-2 rounded-xl border border-mindvex-elements-borderColor overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {metric.icon}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${metric.bgColor} opacity-50 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300`}></div>
                </div>
                <h3 className="text-sm font-medium text-mindvex-elements-textSecondary mb-2">{metric.label}</h3>
                <p className="text-4xl font-bold text-mindvex-elements-textPrimary mb-1">{metric.value}</p>
                {metric.subtitle && (
                  <p className="text-xs text-mindvex-elements-textSecondary">{metric.subtitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Language Distribution & Code Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-mindvex-elements-background-depth-2 rounded-xl border border-mindvex-elements-borderColor p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg">
                📊
              </div>
              <h3 className="text-lg font-semibold text-mindvex-elements-textPrimary">Language Distribution</h3>
            </div>
            <div className="space-y-4">
              {dashboardData.languageDistribution.length > 0 ? (
                dashboardData.languageDistribution.slice(0, 6).map((item, index) => {
                  const percentage = ((item.count / dashboardData.totalFiles) * 100).toFixed(1);
                  const colors = ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-green-500 to-green-600', 'from-yellow-500 to-yellow-600', 'from-pink-500 to-pink-600', 'from-indigo-500 to-indigo-600'];
                  return (
                    <div key={index} className="group">
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="font-medium text-mindvex-elements-textPrimary">{item.language}</span>
                        <span className="text-mindvex-elements-textSecondary">{item.count} files ({percentage}%)</span>
                      </div>
                      <div className="relative w-full bg-mindvex-elements-background-depth-1 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-48 flex items-center justify-center border border-dashed border-mindvex-elements-borderColor rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-3 opacity-30">📈</div>
                    <p className="text-mindvex-elements-textSecondary">No language data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-mindvex-elements-background-depth-2 rounded-xl border border-mindvex-elements-borderColor p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl shadow-lg">
                📝
              </div>
              <h3 className="text-lg font-semibold text-mindvex-elements-textPrimary">Code Statistics</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Total Lines', value: dashboardData.totalLines, icon: '📏', color: 'text-blue-500' },
                { label: 'Code Lines', value: dashboardData.totalCodeLines, icon: '💻', color: 'text-green-500' },
                { label: 'Comment Lines', value: dashboardData.totalCommentLines, icon: '💬', color: 'text-purple-500' },
                { label: 'Blank Lines', value: dashboardData.totalBlankLines, icon: '⚪', color: 'text-gray-400' }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-mindvex-elements-background-depth-1 hover:bg-mindvex-elements-background-depth-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="font-medium text-mindvex-elements-textPrimary">{stat.label}</span>
                  </div>
                  <span className={`text-xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Dependencies & Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-mindvex-elements-background-depth-2 rounded-xl border border-mindvex-elements-borderColor p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg">
                📦
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-mindvex-elements-textPrimary">Dependencies</h3>
                <p className="text-xs text-mindvex-elements-textSecondary">{dashboardData.dependencies.length} total</p>
              </div>
            </div>
            <div className="h-56 overflow-y-auto custom-scrollbar">
              {dashboardData.dependencies.length > 0 ? (
                <div className="space-y-2">
                  {dashboardData.dependencies.slice(0, 20).map((dep, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-mindvex-elements-background-depth-1 hover:bg-mindvex-elements-background-depth-3 transition-colors group">
                      <span className="text-lg group-hover:scale-125 transition-transform">
                        {dep.startsWith('internal:') ? '🔗' : '📦'}
                      </span>
                      <span className="font-mono text-sm text-mindvex-elements-textSecondary truncate flex-1">
                        {dep}
                      </span>
                    </div>
                  ))}
                  {dashboardData.dependencies.length > 20 && (
                    <p className="text-center text-sm text-mindvex-elements-textSecondary py-3">+ {dashboardData.dependencies.length - 20} more dependencies</p>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-mindvex-elements-borderColor rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-3 opacity-30">📦</div>
                    <p className="text-mindvex-elements-textSecondary">No dependencies found</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-mindvex-elements-background-depth-2 rounded-xl border border-mindvex-elements-borderColor p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl shadow-lg">
                ⚠️
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-mindvex-elements-textPrimary">Potential Issues</h3>
                <p className="text-xs text-mindvex-elements-textSecondary">{dashboardData.potentialIssues.length} items found</p>
              </div>
            </div>
            <div className="h-56 overflow-y-auto custom-scrollbar">
              {dashboardData.potentialIssues.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.potentialIssues.slice(0, 10).map((issue, index) => {
                    const issueType = issue.split(' ')[0];
                    const colors = {
                      'TODO': 'bg-blue-500',
                      'FIXME': 'bg-red-500',
                      'HACK': 'bg-yellow-500',
                      'XXX': 'bg-purple-500',
                      'BUG': 'bg-red-600'
                    };
                    return (
                      <div key={index} className="p-3 rounded-lg bg-mindvex-elements-background-depth-1 hover:bg-mindvex-elements-background-depth-3 transition-colors group">
                        <div className="flex items-start gap-3">
                          <span className={`inline-block ${colors[issueType as keyof typeof colors] || 'bg-gray-500'} text-white px-2 py-1 rounded text-xs font-bold shrink-0 group-hover:scale-110 transition-transform`}>
                            {issueType}
                          </span>
                          <span className="text-sm text-mindvex-elements-textSecondary break-all">
                            {issue.substring(issue.indexOf('in'))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {dashboardData.potentialIssues.length > 10 && (
                    <p className="text-center text-sm text-mindvex-elements-textSecondary py-3">+ {dashboardData.potentialIssues.length - 10} more issues</p>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-mindvex-elements-borderColor rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-mindvex-elements-textSecondary">No issues detected!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Architecture Layers */}
        {dashboardData.architectureLayers.length > 0 && (
          <div className="bg-mindvex-elements-background-depth-2 rounded-xl border border-mindvex-elements-borderColor p-6 mb-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
                🏗️
              </div>
              <h3 className="text-lg font-semibold text-mindvex-elements-textPrimary">Architecture Layers</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {dashboardData.architectureLayers.map((layer, index) => (
                <span key={index} className="group px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                  🔷 {layer}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-mindvex-elements-textPrimary mb-4 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { to: '/architecture', icon: '🏗️', label: 'Architecture Diagram', desc: 'Visualize system structure', color: 'hover:border-blue-500' },
              { to: '/knowledge-graph', icon: '🕸️', label: 'Knowledge Graph', desc: 'Explore code relationships', color: 'hover:border-purple-500' },
              { to: '/editor', icon: '💻', label: 'Code Editor', desc: 'Edit and manage files', color: 'hover:border-green-500' }
            ].map((action, idx) => (
              <Link 
                key={idx}
                to={action.to} 
                className={`group relative bg-mindvex-elements-background-depth-2 hover:bg-mindvex-elements-background-depth-3 p-6 rounded-xl border border-mindvex-elements-borderColor transition-all duration-300 hover:shadow-xl hover:scale-105 ${action.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{action.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-mindvex-elements-textPrimary mb-1 group-hover:text-orange-500 transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-sm text-mindvex-elements-textSecondary">{action.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-mindvex-elements-textSecondary group-hover:text-orange-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Workspace Tools */}
        <div>
          <h2 className="text-xl font-bold text-mindvex-elements-textPrimary mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Workspace Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { to: '/chat', icon: '💬', label: 'Chat with Code', desc: 'AI-powered code assistance', color: 'hover:border-blue-500' },
              { to: '/editor', icon: '🔧', label: 'Go to Workspace', desc: 'Access full development environment', color: 'hover:border-green-500' },
              { action: 'newWorkspace', icon: '➕', label: 'New Workspace', desc: 'Start fresh project', color: 'hover:border-purple-500' }
            ].map((tool, idx) => {
              if (tool.action === 'newWorkspace') {
                return (
                  <button 
                    key={idx}
                    onClick={async () => {
                      if (confirm('Are you sure you want to clear the current workspace and start a new one?')) {
                        await workbenchStore.clearWorkspace();
                        toast.success('New workspace created!');
                      }
                    }}
                    className={`group flex items-center gap-4 bg-mindvex-elements-background-depth-2 hover:bg-mindvex-elements-background-depth-3 p-5 rounded-xl border border-mindvex-elements-borderColor transition-all duration-300 hover:shadow-xl hover:scale-105 ${tool.color}`}
                  >
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{tool.icon}</div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-mindvex-elements-textPrimary group-hover:text-orange-500 transition-colors">
                        {tool.label}
                      </h3>
                      <p className="text-sm text-mindvex-elements-textSecondary">{tool.desc}</p>
                    </div>
                    <svg className="w-5 h-5 text-mindvex-elements-textSecondary group-hover:text-orange-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              }
              
              return (
                <Link 
                  key={idx}
                  to={tool.to!} 
                  className={`group flex items-center gap-4 bg-mindvex-elements-background-depth-2 hover:bg-mindvex-elements-background-depth-3 p-5 rounded-xl border border-mindvex-elements-borderColor transition-all duration-300 hover:shadow-xl hover:scale-105 ${tool.color}`}
                >
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{tool.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-mindvex-elements-textPrimary group-hover:text-orange-500 transition-colors">
                      {tool.label}
                    </h3>
                    <p className="text-sm text-mindvex-elements-textSecondary">{tool.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-mindvex-elements-textSecondary group-hover:text-orange-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};