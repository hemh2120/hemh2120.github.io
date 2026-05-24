/**
 * Main JavaScript for Academic Homepage
 * Handles scroll effects and navigation highlighting
 */

document.addEventListener('DOMContentLoaded', function() {
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileIndicator = document.getElementById('mobile-section-indicator');
  const sections = document.querySelectorAll('section[id]');

  // Scroll-based header effect
  function handleScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Update active navigation link
  function updateActiveNav(sectionId) {
    navLinks.forEach(link => {
      const linkSection = link.getAttribute('data-section');
      if (linkSection === sectionId) {
        link.classList.add('active');
        link.classList.remove('text-slate-500');
      } else {
        link.classList.remove('active');
        link.classList.add('text-slate-500');
      }
    });

    // Update mobile indicator
    if (mobileIndicator) {
      const sectionLabels = {
        'about': 'About',
        'news': 'News',
        'research': 'Research',
        'selected': 'Selected',
        'preprints': 'Preprints',
        'publications': 'Publications',
        'misc': 'Misc'
      };
      mobileIndicator.textContent = sectionLabels[sectionId] || sectionId;
    }
  }

  // IntersectionObserver for section visibility
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '-20% 0px -60% 0px'
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        updateActiveNav(entry.target.id);
      }
    });
  }, observerOptions);

  // Observe all sections
  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // Add scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initial check
  handleScroll();

  // Set initial active state
  if (sections.length > 0) {
    updateActiveNav(sections[0].id);
  }
});
/**
 * News content styling enhancement
 * Highlights achievements only
 */
function enhanceNewsContent() {
  const newsItems = document.querySelectorAll('.news-content');
  
  newsItems.forEach((item, index) => {
    let content = item.innerHTML;
    
    // Highlight achievement badges - both use yellow styling
    content = content.replace(
      /\(Directly Accept, Top (\d+\.?\d*)%\)/g,
      '<span class="achievement-badge">Directly Accept, Top $1%</span>'
    );
    
    content = content.replace(
      /\(Oral Presentation, Top (\d+\.?\d*)%\)/g,
      '<span class="achievement-badge">Oral Presentation, Top $1%</span>'
    );

    content = content.replace(
      /\(Spotlight Paper, Top (\d+\.?\d*)%\)/g,
      '<span class="achievement-badge">Spotlight Paper, Top $1%</span>'
    );
    
    content = content.replace(
      /\(Oral and Spotlight, Top (\d+\.?\d*)%\)/g,
      '<span class="achievement-badge">Oral and Spotlight, Top $1%</span>'
    );

    // Conference names are no longer highlighted - removed
    
    if (content !== item.innerHTML) {
      item.innerHTML = content;
    }
    
    // Add hover effect to the parent list item
    const listItem = item.closest('li');
    if (listItem) {
      listItem.classList.add('news-item');
    }
  });
}

// Run enhancement when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add a small delay to ensure all content is rendered
  setTimeout(() => {
    enhanceNewsContent();
  }, 300);
  
  // Also run after any dynamic content changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        setTimeout(enhanceNewsContent, 100);
      }
    });
  });
  
  // Observe the news section for changes
  const newsSection = document.querySelector('#news');
  if (newsSection) {
    observer.observe(newsSection, { childList: true, subtree: true });
  }
});
/**
 * Section collapsible functionality
 * Manages section collapse/expand states and persistence
 */
function initCollapsibleSections() {
  const sections = document.querySelectorAll('section details');
  
  sections.forEach(section => {
    const sectionId = section.closest('section').id;
    
    // Load saved state from localStorage
    const savedState = localStorage.getItem(`section-${sectionId}-open`);
    if (savedState !== null) {
      section.open = savedState === 'true';
    }
    
    // Save state when toggled
    section.addEventListener('toggle', function() {
      localStorage.setItem(`section-${sectionId}-open`, this.open);
      
      // Trigger a custom event for other components that might need to know
      window.dispatchEvent(new CustomEvent('sectionToggled', {
        detail: { sectionId, isOpen: this.open }
      }));
    });
  });
}

// Utility function to expand all sections
function expandAllSections() {
  const sections = document.querySelectorAll('section details');
  sections.forEach(section => {
    section.open = true;
    const sectionId = section.closest('section').id;
    localStorage.setItem(`section-${sectionId}-open`, 'true');
  });
}

// Utility function to collapse all sections
function collapseAllSections() {
  const sections = document.querySelectorAll('section details');
  sections.forEach(section => {
    section.open = false;
    const sectionId = section.closest('section').id;
    localStorage.setItem(`section-${sectionId}-open`, 'false');
  });
}

// Initialize collapsible sections when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initCollapsibleSections, 100);
});

// Add keyboard shortcuts for power users
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + Shift + E: Expand all sections
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
    e.preventDefault();
    expandAllSections();
  }
  
  // Ctrl/Cmd + Shift + C: Collapse all sections
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    collapseAllSections();
  }
});
