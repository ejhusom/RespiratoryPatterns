function mat = Cheyne_Stokes_function(Sum_Time)
%Example:Cheyne_Stokes ��һ������60�룬��Ϣʱ��ȡ���10s������ǰ�����
%�������Ϊ0.1s���趨ʱ��ΪTime
Time=60;
Num_T=Sum_Time/Time;
for T = 0:Num_T-1
%�����0��50���ڲ���5���ϵ㣬������
N=5;
r(1,:)= randi([T*Time 4+T*Time],1,1);
r(2,:)= randi([10+T*Time 14+T*Time],1,1);
r(3,:)= randi([16+T*Time 20+T*Time],1,1);
r(4,:)=randi([26+T*Time 30+T*Time],1,1);
r(5,:)=randi([38+T*Time 40+T*Time],1,1);

%����N+2������
C(1+T*(N+2),:)={T*Time:0.1:r(1,:)};
for i = 1:N-1
    C(i+1+T*(N+2),:)={r(i,:):0.1:r(i+1,:)};
end
%�����һ���ϵ��40��֮�����������һ���ϵ㣬������Ϣ
rand_apnea=randi([r(N,:) (T+1)*Time-20],1,1);
C(N+1+T*(N+2),1)={r(N,:):0.1:rand_apnea};
C(N+2+T*(N+2),1)={rand_apnea:0.1:(T+1)*Time};

%�ֶ����ɺ����ź�
%Cheyne_Stkoes��ǳ�ĺ����׶� a��0.1��0.3�����b��1.37��1.77�����c��-0.05��+0.05�����d��-0.1��0.1���
%Cheyne_Stkoes��ǳ�ĺ����׶� a��0.3��0.4�����b��1.37��1.77�����c��-0.05��+0.05�����d��-0.1��0.1���
%Cheyne_Stkoes����ĺ����׶� a��0.4��0.8�����b��1.37��1.77�����c��-0.05��+0.05�����d��-0.1��0.1���
C{1+T*(N+2),2} =  Breathing(C{1+T*(N+2),1},randa2b(0.2,0.4,1),randa2b(1.37,1.77,1),randa2b(-0.05,0.05,1),randa2b(-0.1,0.1,1));
C{2+T*(N+2),2} =  Breathing(C{2+T*(N+2),1},randa2b(0.2,0.4,1),randa2b(1.37,1.77,1),randa2b(-0.05,0.05,1),randa2b(-0.1,0.1,1));
C{3+T*(N+2),2} =  Breathing(C{3+T*(N+2),1},randa2b(0.6,0.9,1),randa2b(1.37,1.77,1),randa2b(-0.05,0.05,1),randa2b(-0.1,0.1,1));
C{4+T*(N+2),2} =  Breathing(C{4+T*(N+2),1},randa2b(0.6,0.9,1),randa2b(1.37,1.77,1),randa2b(-0.05,0.05,1),randa2b(-0.1,0.1,1));
C{5+T*(N+2),2} =  Breathing(C{5+T*(N+2),1},randa2b(0.2,0.4,1),randa2b(1.37,1.77,1),randa2b(-0.05,0.05,1),randa2b(-0.1,0.1,1));
C{6+T*(N+2),2} =  Breathing(C{6+T*(N+2),1},randa2b(0.2,0.4,1),randa2b(1.37,1.77,1),randa2b(-0.05,0.05,1),randa2b(-0.1,0.1,1));
%Biots��Ϣ�׶� a��-0.05��0.05�����b��0.01��3.14�����c��-0.01��+0.01�����d��-0.01��0.01���
C{7+T*(N+2),2}= Breathing(C{7+T*(N+2),1},randa2b(-0.05,0.05,1),randa2b(0.01,3.14,1),randa2b(-0.2,0.2,1),randa2b(-0.01,0.01,1));

% %����N���ϵ�
% for i=1:N+1
%     C{i,2}(:,end)=C{i+1,2}(:,1);
% end
end

%��Cell����mat
index=0;
for i=1:(N+2)*Num_T
    for j=1:length(C{i,1})-1
    index= index+1;
  %mat(index,1) = C{i,1}(j);
    mat(1,index) = C{i,2}(j);
    end
end
%��Ӹ�˹������SNRΪ20
mat(1,:) = awgn(mat(1,:),20,'measured');
%����mat
%save F:\mat\Eupnea\test1 mat

% %���ƺ�������
% plot(mat(:,1),mat(:,2));
% title('Cheyne Stokes')
% xlabel('Time')
% ylabel('Intensity')
% axis([0 Time*3 -1 1]);
