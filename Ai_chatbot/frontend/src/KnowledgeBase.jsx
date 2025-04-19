import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import './css/KnowledgeBase.css';

const KnowledgeBase = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [articles, setArticles] = useState([]);

    const handleNewDocument = () => {
        const options = ['Write Manually', 'Import URL', 'Upload PDF'];
        // Implementation for new document creation
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        // Implement search functionality
    };

    const handleRefresh = () => {
        // Implement refresh functionality
    };

    return (
        <div className="knowledge-base-container">
            <Sidebar />
            <div className="main-content">
                <div className="actions-bar">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="filters">
                        <select defaultValue="">
                            <option value="">All Categories</option>
                            {/* Add filter options */}
                        </select>
                    </div>
                    <button className="refresh-btn" onClick={handleRefresh}>
                        Refresh
                    </button>
                    <button className="new-doc-btn" onClick={handleNewDocument}>
                        + New
                    </button>
                </div>

                <div className="articles-container">
                    {articles.length === 0 ? (
                        <div className="no-articles">
                            No articles found. Create a new one to get started.
                        </div>
                    ) : (
                        articles.map((article) => (
                            <div key={article.id} className="article-card">
                                {/* Article content */}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBase;
