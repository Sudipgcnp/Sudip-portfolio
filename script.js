const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
const siteHeader = document.querySelector('.header');

const updateHeaderIdentity = () => siteHeader.classList.toggle('has-scrolled', window.scrollY > 120);
window.addEventListener('scroll', updateHeaderIdentity, { passive: true });
updateHeaderIdentity();

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
    menuButton.focus();
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();

const projectFilters = document.querySelectorAll('.project-filter');
const projectEntries = document.querySelectorAll('[data-project-categories]');
const projectsEmpty = document.querySelector('.projects-empty');
const projectCarousel = document.querySelector('.project-carousel');
const projectFootnote = document.querySelector('.project-footnote');
let activeProjectPreview = null;
let projectVisibilityObserver = null;

const closeActiveProjectPreview = () => {
  projectVisibilityObserver?.disconnect();
  projectVisibilityObserver = null;
  if (!activeProjectPreview) return;
  const { details, button } = activeProjectPreview;
  details.hidden = true;
  button.setAttribute('aria-expanded', 'false');
  button.querySelector('.project-tile-action-label').textContent = 'Preview';
  button.querySelector('.project-tile-action b').textContent = '↗';
  activeProjectPreview = null;
};

projectFilters.forEach((filterButton) => {
  filterButton.addEventListener('click', () => {
    closeActiveProjectPreview();
    const selectedFilter = filterButton.dataset.filter;
    let visibleProjects = 0;

    projectFilters.forEach((button) => {
      const isSelected = button === filterButton;
      button.classList.toggle('is-active', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });

    projectEntries.forEach((entry) => {
      const categories = entry.dataset.projectCategories.split(/\s+/);
      const isVisible = selectedFilter === 'all' || categories.includes(selectedFilter);
      entry.hidden = !isVisible;
      if (isVisible) visibleProjects += 1;
    });

    projectsEmpty.hidden = visibleProjects > 0;
    projectCarousel.hidden = visibleProjects === 0;
    projectFootnote.hidden = visibleProjects === 0;
    document.querySelectorAll('.project-card').forEach((details) => { details.hidden = true; });
    document.querySelectorAll('.project-tile-open').forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
      button.querySelector('.project-tile-action-label').textContent = 'Preview';
      button.querySelector('.project-tile-action b').textContent = '↗';
    });
  });
});

document.querySelectorAll('.project-tile-open').forEach((button) => {
  button.addEventListener('click', () => {
    const details = document.getElementById(button.getAttribute('aria-controls'));
    if (activeProjectPreview?.details === details) {
      closeActiveProjectPreview();
      return;
    }

    closeActiveProjectPreview();
    activeProjectPreview = { details, button };
    details.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    button.querySelector('.project-tile-action-label').textContent = 'Close preview';
    button.querySelector('.project-tile-action b').textContent = '−';
    requestAnimationFrame(() => details.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
    }));

    let previewHasBeenVisible = false;
    projectVisibilityObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        previewHasBeenVisible = true;
      } else if (previewHasBeenVisible && activeProjectPreview?.details === details) {
        closeActiveProjectPreview();
      }
    }, { rootMargin: '-100px 0px 0px 0px', threshold: 0.01 });
    projectVisibilityObserver.observe(details);
  });
});

const workSection = document.querySelector('.work');
if (workSection && 'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const projectRevealItems = [
    workSection.querySelector('.projects-heading'),
    workSection.querySelector('.project-filters'),
    ...workSection.querySelectorAll('.project-entry')
  ].filter(Boolean);
  projectRevealItems.forEach((item, index) => {
    if (item.classList.contains('project-entry')) {
      item.style.setProperty('--project-reveal-delay', `${Math.min(index - 2, 5) * 90}ms`);
    }
  });
  workSection.classList.add('projects-reveal-ready');
  const projectsRevealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });
  projectRevealItems.forEach((item) => projectsRevealObserver.observe(item));
}

const phoneTrigger = document.querySelector('.phone-trigger');
const phoneOptions = document.querySelector('.phone-options');
const closePhoneOptions = () => {
  document.querySelector('.contact-phone').classList.remove('is-open');
  phoneTrigger.setAttribute('aria-expanded', 'false');
};

phoneTrigger.addEventListener('click', () => {
  const isOpen = phoneTrigger.getAttribute('aria-expanded') === 'true';
  phoneTrigger.setAttribute('aria-expanded', String(!isOpen));
  document.querySelector('.contact-phone').classList.toggle('is-open', !isOpen);
});

const phoneRow = document.querySelector('.contact-phone');
phoneRow.addEventListener('pointerenter', () => {
  phoneRow.classList.add('is-open');
  phoneTrigger.setAttribute('aria-expanded', 'true');
});
phoneRow.addEventListener('pointerleave', () => {
  if (!phoneRow.contains(document.activeElement)) closePhoneOptions();
});
phoneRow.addEventListener('focusout', (event) => {
  if (!phoneRow.contains(event.relatedTarget) && !phoneRow.matches(':hover')) closePhoneOptions();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.contact-phone')) closePhoneOptions();
});

phoneOptions.querySelectorAll('a').forEach((link) => link.addEventListener('click', closePhoneOptions));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !phoneOptions.hidden) {
    closePhoneOptions();
    phoneTrigger.focus();
  }
});

const backToTop = document.querySelector('.back-to-top');
const updateBackToTop = () => backToTop.classList.toggle('is-visible', window.scrollY > 420);
window.addEventListener('scroll', updateBackToTop, { passive: true });
updateBackToTop();
backToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  });
});

const supportsMagneticHover = window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (supportsMagneticHover) {
  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = element.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 16;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
      element.style.setProperty('--magnetic-x', `${x.toFixed(1)}px`);
      element.style.setProperty('--magnetic-y', `${y.toFixed(1)}px`);
    });

    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--magnetic-x', '0px');
      element.style.setProperty('--magnetic-y', '0px');
    });
  });
}

const cursorFollower = document.querySelector('.cursor-follower');
const canShowCursorFollower = window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (cursorFollower && canShowCursorFollower) {
  let pointerX = 0;
  let pointerY = 0;
  let followerX = 0;
  let followerY = 0;
  let animationFrame = 0;
  let zoomedWord = null;
  const retiringWords = new Map();
  let wordZoomFrame = 0;
  let latestPointerPosition = null;

  const unwrapWord = (word) => {
    if (!word.parentNode) return;
    const parent = word.parentNode;
    parent.replaceChild(document.createTextNode(word.textContent), word);
    parent.normalize();
  };

  const removeWordZoom = (immediate = false) => {
    if (!zoomedWord) return;
    const leaving = zoomedWord;
    zoomedWord = null;
    leaving.classList.remove('is-active');
    if (immediate) {
      unwrapWord(leaving);
      return;
    }
    const timer = window.setTimeout(() => {
      unwrapWord(leaving);
      retiringWords.delete(leaving);
    }, 150);
    retiringWords.set(leaving, timer);
  };

  const getCaretRange = (event) => {
    if (document.caretRangeFromPoint) return document.caretRangeFromPoint(event.clientX, event.clientY);
    const position = document.caretPositionFromPoint?.(event.clientX, event.clientY);
    if (!position) return null;
    const range = document.createRange();
    range.setStart(position.offsetNode, position.offset);
    range.collapse(true);
    return range;
  };

  const updateWordZoom = (event) => {
    if (zoomedWord) {
      const bounds = zoomedWord.getBoundingClientRect();
      if (event.clientX >= bounds.left && event.clientX <= bounds.right &&
          event.clientY >= bounds.top && event.clientY <= bounds.bottom) return;
    }

    let caret = getCaretRange(event);
    if (!caret || caret.startContainer.nodeType !== Node.TEXT_NODE) {
      removeWordZoom();
      return;
    }
    if (caret.startContainer.parentElement?.closest('.project-footnote')) {
      removeWordZoom();
      return;
    }
    const wordWrapper = caret.startContainer.parentElement?.closest('.cursor-word-zoom');
    if (wordWrapper) {
      if (wordWrapper === zoomedWord) return;
      const timer = retiringWords.get(wordWrapper);
      if (timer) {
        removeWordZoom();
        window.clearTimeout(timer);
        retiringWords.delete(wordWrapper);
        zoomedWord = wordWrapper;
        window.requestAnimationFrame(() => {
          if (wordWrapper === zoomedWord && wordWrapper.isConnected) wordWrapper.classList.add('is-active');
        });
        return;
      }
    }
    if (zoomedWord?.contains(caret.startContainer)) return;

    removeWordZoom();
    caret = getCaretRange(event);
    if (!caret || caret.startContainer.nodeType !== Node.TEXT_NODE) return;

    const textNode = caret.startContainer;
    const text = textNode.textContent;
    let start = caret.startOffset;
    let end = caret.startOffset;
    while (start > 0 && !/\s/.test(text[start - 1])) start--;
    while (end < text.length && !/\s/.test(text[end])) end++;
    if (start === end) return;

    const wordRange = document.createRange();
    wordRange.setStart(textNode, start);
    wordRange.setEnd(textNode, end);
    zoomedWord = document.createElement('span');
    zoomedWord.className = 'cursor-word-zoom';
    try {
      wordRange.surroundContents(zoomedWord);
      const word = zoomedWord;
      window.requestAnimationFrame(() => {
        if (word === zoomedWord && word.isConnected) word.classList.add('is-active');
      });
    } catch {
      zoomedWord = null;
    }
  };

  const followPointer = () => {
    followerX += (pointerX - followerX) * 0.18;
    followerY += (pointerY - followerY) * 0.18;
    cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
    if (Math.abs(pointerX - followerX) + Math.abs(pointerY - followerY) > 0.3) {
      animationFrame = window.requestAnimationFrame(followPointer);
    } else {
      animationFrame = 0;
    }
  };

  document.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    latestPointerPosition = { clientX: event.clientX, clientY: event.clientY };
    if (!wordZoomFrame) {
      wordZoomFrame = window.requestAnimationFrame(() => {
        wordZoomFrame = 0;
        updateWordZoom(latestPointerPosition);
      });
    }
    cursorFollower.classList.add('is-visible');
    if (!animationFrame) animationFrame = window.requestAnimationFrame(followPointer);
  });

  document.addEventListener('pointerover', (event) => {
    const interactive = event.target.closest('a, button, input, select, textarea, [role="button"]');
    cursorFollower.classList.toggle('is-on-control', Boolean(interactive));
  });

  document.addEventListener('pointerdown', () => cursorFollower.classList.add('is-pressed'));
  document.addEventListener('pointerup', () => cursorFollower.classList.remove('is-pressed'));
  document.addEventListener('pointerleave', () => {
    cursorFollower.classList.remove('is-visible', 'is-on-control', 'is-pressed');
    if (wordZoomFrame) window.cancelAnimationFrame(wordZoomFrame);
    wordZoomFrame = 0;
    removeWordZoom(true);
    retiringWords.forEach((timer, word) => {
      window.clearTimeout(timer);
      unwrapWord(word);
    });
    retiringWords.clear();
  });
}

const contactHeading = document.querySelector('.contact h2');
if (contactHeading && 'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const contactHeadingObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      contactHeading.classList.add('is-typing');
      contactHeadingObserver.disconnect();
    }
  }, { threshold: 0.25 });
  contactHeadingObserver.observe(contactHeading);
}

if (window.matchMedia('(pointer: fine)').matches) {
  const servicesSection = document.querySelector('.services');
  const getServiceDragBounds = (drag) => {
    const bounds = servicesSection.getBoundingClientRect();
    const inset = 12;
    return {
      minLeft: bounds.left + inset,
      maxLeft: Math.max(bounds.left + inset, bounds.right - drag.width - inset),
      minTop: bounds.top + inset,
      maxTop: Math.max(bounds.top + inset, bounds.bottom - drag.height - inset)
    };
  };
  document.querySelectorAll('.service-card').forEach((card) => {
    let drag = null;

    const startAnimation = () => {
      if (!drag || drag.frame) return;
      drag.frame = window.requestAnimationFrame(function moveCardFrame(now) {
        if (!drag) return;
        const elapsed = Math.min(32, now - (drag.lastFrame || now));
        drag.lastFrame = now;

        if (drag.released) {
          const decay = Math.pow(0.9, elapsed / 16.67);
          drag.velocityX *= decay;
          drag.velocityY *= decay;
          drag.currentLeft += drag.velocityX * elapsed;
          drag.currentTop += drag.velocityY * elapsed;
        } else {
          const follow = 1 - Math.pow(0.7, elapsed / 16.67);
          drag.currentLeft += (drag.targetLeft - drag.currentLeft) * follow;
          drag.currentTop += (drag.targetTop - drag.currentTop) * follow;
        }

        const limits = getServiceDragBounds(drag);
        if (drag.currentLeft < limits.minLeft || drag.currentLeft > limits.maxLeft) drag.velocityX = 0;
        if (drag.currentTop < limits.minTop || drag.currentTop > limits.maxTop) drag.velocityY = 0;
        drag.currentLeft = Math.min(limits.maxLeft, Math.max(limits.minLeft, drag.currentLeft));
        drag.currentTop = Math.min(limits.maxTop, Math.max(limits.minTop, drag.currentTop));
        card.style.left = `${drag.currentLeft}px`;
        card.style.top = `${drag.currentTop}px`;

        const speed = Math.hypot(drag.velocityX, drag.velocityY);
        if (drag.released && (speed < 0.035 || now - drag.releaseTime > 800)) {
          finishPlacement();
          return;
        }
        drag.frame = window.requestAnimationFrame(moveCardFrame);
      });
    };

    const finishPlacement = () => {
      if (!drag || !drag.moved || !card._dragPlaceholder?.isConnected) {
        drag = null;
        return;
      }
      const sectionBounds = servicesSection.getBoundingClientRect();
      card._dragPlaceholder.before(card);
      Object.assign(card.style, {
        position: 'absolute',
        left: `${drag.currentLeft - sectionBounds.left}px`,
        top: `${drag.currentTop - sectionBounds.top}px`,
        width: `${drag.width}px`, height: `${drag.height}px`, margin: '0', zIndex: '10'
      });
      card.classList.remove('is-dragging');
      card.classList.add('is-positioned');
      drag = null;
    };

    card.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || drag) return;
      const bounds = card.getBoundingClientRect();
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        currentLeft: bounds.left,
        currentTop: bounds.top,
        targetLeft: bounds.left,
        targetTop: bounds.top,
        offsetX: event.clientX - bounds.left,
        offsetY: event.clientY - bounds.top,
        width: bounds.width,
        height: bounds.height,
        moved: false,
        released: false,
        velocityX: 0,
        velocityY: 0,
        lastPointerX: event.clientX,
        lastPointerY: event.clientY,
        lastPointerTime: performance.now(),
        frame: 0,
        lastFrame: 0
      };
      event.preventDefault();
    });

    document.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (!drag.moved && distance < 5) return;

      if (!drag.moved) {
        drag.moved = true;
        if (!card._dragPlaceholder) {
          const placeholder = document.createElement('div');
          placeholder.className = 'service-card-placeholder';
          placeholder.style.height = `${drag.height}px`;
          card.before(placeholder);
          card._dragPlaceholder = placeholder;
        }
        card.classList.add('is-dragging');
        Object.assign(card.style, {
          position: 'fixed', left: `${drag.currentLeft}px`, top: `${drag.currentTop}px`,
          width: `${drag.width}px`, height: `${drag.height}px`, margin: '0',
          zIndex: '1000'
        });
        document.body.append(card);
      }

      const limits = getServiceDragBounds(drag);
      drag.targetLeft = Math.min(limits.maxLeft, Math.max(limits.minLeft, event.clientX - drag.offsetX));
      drag.targetTop = Math.min(limits.maxTop, Math.max(limits.minTop, event.clientY - drag.offsetY));
      const time = performance.now();
      const elapsed = Math.max(1, time - drag.lastPointerTime);
      const nextVelocityX = (event.clientX - drag.lastPointerX) / elapsed;
      const nextVelocityY = (event.clientY - drag.lastPointerY) / elapsed;
      drag.velocityX = drag.velocityX * 0.55 + nextVelocityX * 0.45;
      drag.velocityY = drag.velocityY * 0.55 + nextVelocityY * 0.45;
      drag.lastPointerX = event.clientX;
      drag.lastPointerY = event.clientY;
      drag.lastPointerTime = time;
      startAnimation();
    });

    const finishDrag = (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (drag.moved) {
        const limits = getServiceDragBounds(drag);
        drag.targetLeft = Math.min(limits.maxLeft, Math.max(limits.minLeft, event.clientX - drag.offsetX));
        drag.targetTop = Math.min(limits.maxTop, Math.max(limits.minTop, event.clientY - drag.offsetY));
        drag.released = true;
        drag.releaseTime = performance.now();
        startAnimation();
      } else {
        drag = null;
      }
    };
    document.addEventListener('pointerup', finishDrag);
    document.addEventListener('pointercancel', finishDrag);
  });

  const servicesGrid = servicesSection?.querySelector('.service-grid');
  if (servicesSection && servicesGrid && 'IntersectionObserver' in window) {
    const returnCardsToGrid = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) return;
      servicesGrid.querySelectorAll('.service-card.is-positioned').forEach((card) => {
        const placeholder = card._dragPlaceholder;
        if (placeholder?.isConnected) {
          placeholder.before(card);
          placeholder.remove();
        }
        card.removeAttribute('style');
        card.classList.remove('is-positioned', 'is-dragging');
        delete card._dragPlaceholder;
      });
    });
    returnCardsToGrid.observe(servicesSection);
  }
}

const serviceRole = document.querySelector('.services-role');
const servicesSection = document.querySelector('.services');
const serviceRoles = [
  'Digital marketing',
  'Facebook Ads',
  'Google Ads',
  'Social media management',
  'Lead generation',
  'SMS and WhatsApp marketing',
  'Email marketing',
  'Video editing',
  'YouTube thumbnails',
  'Content writing'
];
if (serviceRole && servicesSection && 'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let roleIndex = 0;
  let roleTimer = 0;
  const markRoleChange = () => {
    serviceRole.classList.add('is-highlighted');
    serviceRole.classList.remove('is-changing');
    void serviceRole.offsetWidth;
    serviceRole.classList.add('is-changing');
    window.setTimeout(() => serviceRole.classList.remove('is-changing'), 720);
  };
  const slideToRole = (nextText) => {
    const outgoing = document.createElement('span');
    outgoing.className = 'service-role-text service-role-exit';
    outgoing.textContent = serviceRole.textContent.trim();
    serviceRole.replaceChildren(outgoing);
    markRoleChange();
    window.setTimeout(() => {
      const incoming = document.createElement('span');
      incoming.className = 'service-role-text service-role-enter';
      incoming.textContent = nextText;
      serviceRole.replaceChildren(incoming);
    }, 240);
    window.setTimeout(() => {
      serviceRole.textContent = nextText;
    }, 680);
  };
  const serviceRoleObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      if (!roleTimer) {
        const initialRole = document.createElement('span');
        initialRole.className = 'service-role-text service-role-enter';
        initialRole.textContent = serviceRole.textContent.trim();
        serviceRole.replaceChildren(initialRole);
        markRoleChange();
        roleTimer = window.setInterval(() => {
          roleIndex = (roleIndex + 1) % serviceRoles.length;
          slideToRole(serviceRoles[roleIndex]);
        }, 1750);
      }
    } else if (roleTimer) {
      window.clearInterval(roleTimer);
      roleTimer = 0;
    }
  }, { threshold: 0.25 });
  serviceRoleObserver.observe(servicesSection);
}

const typewriterTargets = document.querySelectorAll('.typewriter-target');
if (typewriterTargets.length && 'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const typewriterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target = entry.target;
      if (entry.isIntersecting) {
        target.classList.remove('is-reset', 'is-typing');
        void target.offsetWidth;
        target.classList.add('is-typing');
        if (!target.closest('.services')) typewriterObserver.unobserve(target);
      } else if (target.closest('.services') && target.classList.contains('is-typing')) {
        target.classList.remove('is-typing');
        target.classList.add('is-reset');
      }
    });
  }, { threshold: 0.2 });
  typewriterTargets.forEach((target) => typewriterObserver.observe(target));
}
