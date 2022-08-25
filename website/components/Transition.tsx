import React, { useRef, useEffect, useContext } from 'react';
import { CSSTransition as ReactCSSTransition } from 'react-transition-group';

interface TransitionProps {
  show: boolean;
  enter?: string;
  enterStart?: string;
  enterEnd?: string;
  leave?: string;
  leaveStart?: string;
  leaveEnd?: string;
  appear?: boolean;
  unmountOnExit?: boolean;
  tag?: keyof JSX.IntrinsicElements;
  isInitialRender?: boolean;
}

const TransitionContext = React.createContext<{ parent: TransitionProps }>({
  parent: { show: false, appear: false, isInitialRender: false, unmountOnExit: false },
})

function useIsInitialRender() {
  const isInitialRender = useRef(true);
  useEffect(() => {
    isInitialRender.current = false;
  }, [])
  return isInitialRender.current;
}

const CSSTransition: React.FunctionComponent<React.PropsWithChildren<TransitionProps>> = ({
  show,
  enter = '',
  enterStart = '',
  enterEnd = '',
  leave = '',
  leaveStart = '',
  leaveEnd = '',
  appear,
  unmountOnExit,
  tag: Component = 'div',
  children,
  ...rest
}) => {
  const enterClasses = enter.split(' ').filter((s) => s.length);
  const enterStartClasses = enterStart.split(' ').filter((s) => s.length);
  const enterEndClasses = enterEnd.split(' ').filter((s) => s.length);
  const leaveClasses = leave.split(' ').filter((s) => s.length);
  const leaveStartClasses = leaveStart.split(' ').filter((s) => s.length);
  const leaveEndClasses = leaveEnd.split(' ').filter((s) => s.length);
  const removeFromDom = unmountOnExit;

  const addClasses = (node: HTMLElement, classes: string[]) => {
    classes.length && node.classList.add(...classes);
  }

  function removeClasses(node: HTMLElement, classes: string[]) {
    classes.length && node.classList.remove(...classes);
  }

  const nodeRef = React.useRef<HTMLElement>(null);

  return (
    <ReactCSSTransition
      appear={appear}
      nodeRef={nodeRef}
      unmountOnExit={removeFromDom}
      in={show}
      addEndListener={(done) => {
        nodeRef.current?.addEventListener('transitionend', done, false)
      }}
      onEnter={() => {
        if (!removeFromDom && nodeRef.current) nodeRef.current.style.display = 'block';
        nodeRef.current && addClasses(nodeRef.current, [...enterClasses, ...enterStartClasses])
      }}
      onEntering={() => {
        nodeRef.current && removeClasses(nodeRef.current, enterStartClasses)
        nodeRef.current && addClasses(nodeRef.current, enterEndClasses)
      }}
      onEntered={() => {
        nodeRef.current && removeClasses(nodeRef.current, [...enterEndClasses, ...enterClasses])
      }}
      onExit={() => {
        nodeRef.current && addClasses(nodeRef.current, [...leaveClasses, ...leaveStartClasses])
      }}
      onExiting={() => {
        nodeRef.current && removeClasses(nodeRef.current, leaveStartClasses)
        nodeRef.current && addClasses(nodeRef.current, leaveEndClasses)
      }}
      onExited={() => {
        nodeRef.current && removeClasses(nodeRef.current, [...leaveEndClasses, ...leaveClasses])
        if (!removeFromDom && nodeRef.current) nodeRef.current.style.display = 'none';
      }}
    >
      {/* @ts-ignore */}
      <Component ref={nodeRef} {...rest} style={{ display: !removeFromDom ? 'none' : 'block' }}>{children}</Component>
    </ReactCSSTransition>
  )
}

const Transition: React.FunctionComponent<React.PropsWithChildren<React.HTMLProps<HTMLElement> & TransitionProps>> = ({ show, appear, ...rest }) => {
  const { parent } = useContext(TransitionContext);
  const isInitialRender = useIsInitialRender();
  const isChild = show === undefined;

  if (isChild) {
    return (
      <CSSTransition
        appear={parent.appear || !parent.isInitialRender}
        show={parent.show}
        {...rest}
      />
    )
  }

  return (
    <TransitionContext.Provider
      value={{
        parent: {
          show,
          isInitialRender,
          appear,
          unmountOnExit: parent.unmountOnExit,
        },
      }}
    >
      <CSSTransition appear={appear} show={show} {...rest} />
    </TransitionContext.Provider>
  )
}

export default Transition;
