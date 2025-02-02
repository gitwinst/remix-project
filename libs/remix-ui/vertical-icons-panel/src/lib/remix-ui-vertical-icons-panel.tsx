/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'

import './remix-ui-vertical-icons-panel.css'
import OtherIcons from './components/OtherIcons'
import { VerticalIcons } from '../../types/vertical-icons-panel'
import Home from './components/Home'
import Settings from './components/Settings'
import { RequiredSection } from './components/RequiredSection'
import { verticalScrollReducer } from './reducers/verticalScrollReducer'
export interface RemixUiVerticalIconsPanelProps {
  verticalIconsPlugin: VerticalIcons
}

const initialState = {
  scrollHeight: 0,
  clientHeight: 0,
  scrollState: false
}

export function RemixUiVerticalIconsPanel ({
  verticalIconsPlugin
}: RemixUiVerticalIconsPanelProps) {
  const scrollableRef = useRef<any>()
  const iconPanelRef = useRef<any>()
  const [activateScroll, dispatchScrollAction] = useReducer(verticalScrollReducer, initialState)

  useEffect(() => {
    const evaluateScrollability = (evt: any) => {
      dispatchScrollAction({
        type: 'resize',
        payload: {
          scrollHeight: document.querySelector('#remixuiScrollable')?.scrollHeight,
          clientHeight: document.querySelector('#remixuiScrollable')?.clientHeight,
          scrollState: false
        }
      })
    }
    addEventListener('resize', evaluateScrollability)

    return () => {
      removeEventListener('resize', evaluateScrollability)
    }
  })

  function onThemeChanged (themeType: any) {
    const invert = themeType === 'dark' ? 1 : 0
    // @ts-ignore
    const active = iconPanelRef.current.querySelector('.active')
    if (active) {
      // @ts-ignore
      const image = iconPanelRef.current.querySelector('.remixui_image')
      image.style.setProperty('filter', `invert(${invert})`)
    }
  }

  function removeActive () {
    // @ts-ignore
    const images = iconPanelRef.current.querySelectorAll('.remixui_image')
    images.forEach(function (im: any) {
      im.style.setProperty('filter', 'invert(0.5)')
    })

    // remove active
    // @ts-ignore
    const currentActive = iconPanelRef.current.querySelector('.active')
    if (currentActive) {
      currentActive.classList.remove('active')
    }
  }

  function addActive (name: string) {
    if (name === 'home') return
    const themeType = verticalIconsPlugin.registry.get('themeModule').api.currentTheme().quality
    const invert = themeType === 'dark' ? 1 : 0
    const brightness = themeType === 'dark' ? '150' : '0' // should be >100 for icons with color
    // @ts-ignore
    const nextActive = iconPanelRef.current.querySelector(`[plugin="${name}"]`)
    if (nextActive) {
      const image = nextActive.querySelector('.remixui_image')
      nextActive.classList.add('active')
      image.style.setProperty('filter', `invert(${invert}) grayscale(1) brightness(${brightness}%)`)
    }
  }

  async function itemContextAction (e: any, name: string, documentation: string) {
    verticalIconsPlugin.appManager.deactivatePlugin(name)
    if (e.target.parentElement.classList.contains('active')) {
      verticalIconsPlugin.select('filePanel')
    }
    verticalIconsPlugin.renderComponent()
  }

  useEffect(() => {
    const themeModule = verticalIconsPlugin.registry.get('themeModule').api
    themeModule.events.on('themeChanged', (theme: any) => {
      onThemeChanged(theme.quality)
    })
    return () => {
      themeModule.events.off('themeChanged')
    }
  }, [])

  useEffect(() => {
    if (verticalIconsPlugin.targetProfileForChange && verticalIconsPlugin.targetProfileForChange.udapp) {
      const doWalkThroughEvent = new Event('doWalkThrough')
      document.dispatchEvent(doWalkThroughEvent)
    }
  }, [Object.keys(verticalIconsPlugin.targetProfileForChange).length])

  return (
    <div id="iconsP" className="h-100">
      <div className="remixui_icons d-flex flex-column vh-100" ref={iconPanelRef}>
        <Home verticalIconPlugin={verticalIconsPlugin} />
        <div className={scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight
          ? 'remixui_default-icons-container remixui_requiredSection' : activateScroll && activateScroll.scrollState ? 'remixui_default-icons-container remixui_requiredSection' : 'remixui_requiredSection'}>
          <RequiredSection
            verticalIconsPlugin={verticalIconsPlugin}
            addActive={addActive}
            removeActive={removeActive}
            itemContextAction={itemContextAction}
            scrollableRef={scrollableRef}
          />
        </div>
        <div
          id="remixuiScrollable"
          className={scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight
            ? 'remixui_default-icons-container remixui_scrollable-container remixui_scrollbar remixui_hide-scroll'
            : activateScroll && activateScroll.scrollState ? 'remixui_default-icons-container remixui_scrollable-container remixui_scrollbar remixui_hide-scroll' : 'remixui_scrollable-container remixui_scrollbar remixui_hide-scroll'}
          ref={scrollableRef}
        >
          <OtherIcons
            verticalIconsPlugin={verticalIconsPlugin}
            addActive={addActive}
            removeActive={removeActive}
            itemContextAction={itemContextAction}
          />
        </div>
        {verticalIconsPlugin.targetProfileForChange &&
          Object.keys(verticalIconsPlugin.targetProfileForChange).length ? (
            <Fragment>
              <Settings
                verticalIconsPlugin={verticalIconsPlugin}
                addActive={addActive}
                removeActive={removeActive}
                itemContextAction={itemContextAction}
                scrollableRef={scrollableRef}
              />
            </Fragment>
          ) : null}
      </div>
    </div>
  )
}
