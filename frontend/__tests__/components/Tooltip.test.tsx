import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from '@/components/Tooltip';

describe('Tooltip', () => {
  const defaultProps = {
    content: 'ツールチップの内容',
    isVisible: false,
    onMouseEnter: jest.fn(),
    onMouseLeave: jest.fn(),
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('レンダリング', () => {
    it('should_render_children_correctly', () => {
      render(
        <Tooltip {...defaultProps}>
          <span>トリガー要素</span>
        </Tooltip>
      );

      expect(screen.getByText('トリガー要素')).toBeInTheDocument();
    });

    it('should_not_render_tooltip_content_when_isVisible_is_false', () => {
      render(
        <Tooltip {...defaultProps}>
          <span>トリガー</span>
        </Tooltip>
      );

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should_render_tooltip_content_when_isVisible_is_true_on_desktop', () => {
      // デスクトップサイズをシミュレート
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      window.dispatchEvent(new Event('resize'));

      render(
        <Tooltip {...defaultProps} isVisible={true}>
          <span>トリガー</span>
        </Tooltip>
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('ツールチップの内容')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('should_have_role_button_on_trigger_element', () => {
      render(
        <Tooltip {...defaultProps}>
          <span>トリガー</span>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('tabIndex', '0');
      expect(trigger).toHaveAttribute('aria-label', '詳細情報');
    });

    it('should_handle_keyboard_enter_key', () => {
      render(
        <Tooltip {...defaultProps}>
          <span>トリガー</span>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.keyDown(trigger, { key: 'Enter' });

      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('should_handle_keyboard_space_key', () => {
      render(
        <Tooltip {...defaultProps}>
          <span>トリガー</span>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.keyDown(trigger, { key: ' ' });

      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('should_not_trigger_onClick_for_other_keys', () => {
      render(
        <Tooltip {...defaultProps}>
          <span>トリガー</span>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.keyDown(trigger, { key: 'Tab' });

      expect(defaultProps.onClick).not.toHaveBeenCalled();
    });
  });

  describe('マウスイベント', () => {
    it('should_call_onMouseEnter_when_mouse_enters', () => {
      render(
        <Tooltip {...defaultProps}>
          <span>トリガー</span>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      expect(defaultProps.onMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('should_call_onMouseLeave_when_mouse_leaves', () => {
      render(
        <Tooltip {...defaultProps}>
          <span>トリガー</span>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseLeave(trigger);

      expect(defaultProps.onMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('should_call_onClick_when_clicked', () => {
      render(
        <Tooltip {...defaultProps}>
          <span>トリガー</span>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('フォーカスイベント', () => {
    it('should_call_onMouseEnter_when_focused', () => {
      render(
        <Tooltip {...defaultProps}>
          <span>トリガー</span>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.focus(trigger);

      expect(defaultProps.onMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('should_call_onMouseLeave_when_blurred', () => {
      render(
        <Tooltip {...defaultProps}>
          <span>トリガー</span>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.blur(trigger);

      expect(defaultProps.onMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe('ボタンネスト問題の修正', () => {
    it('should_use_div_instead_of_button_to_prevent_nesting_issues', () => {
      const { container } = render(
        <Tooltip {...defaultProps}>
          <span>トリガー</span>
        </Tooltip>
      );

      // トリガー要素がdivであることを確認（buttonではない）
      const triggerElement = container.querySelector('[role="button"]');
      expect(triggerElement?.tagName).toBe('DIV');
    });
  });
});
