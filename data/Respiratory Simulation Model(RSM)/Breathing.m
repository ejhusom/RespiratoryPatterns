function [ Breathing_signal ] = Breathing(x,a,b,c ,d)
%aΪ���ȣ���������ȡ�
%bΪƵ�ʣ����������ʡ�
%cΪÿ���ϵ�֮��ķ���ƫ������
%dΪÿһ�β�����ʱ��ķ���ƫ��
%SNRΪ����ȡ�
%   �˴���ʾ��ϸ˵��
Breathing_signal =a*sin(b*x)+c+d*(x-x(1));

end

