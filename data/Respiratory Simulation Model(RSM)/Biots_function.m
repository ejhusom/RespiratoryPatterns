function mat= Biots_function (Sum_Time,N)
%Example:Biots ����Ϣʱ��ȡ���10�벢��ǰ���,һ������30s��
%�������Ϊ0.1s��ÿ������ʱ��ΪTime��Ĭ��30�룩��������ΪT_num
Time=60;
T_num=Sum_Time/Time;
for T = 0:T_num-1
%�����0��Time-10���������ڲ���N���ϵ㣬������
N=5;
r =sort( randi([T*Time (T+1)*Time-10],N,1));
%����N+2������
C(1+T*(N+2),:)={T*Time:0.1:r(1,:)};
    for i = 1:N-1
        C(i+1+T*(N+2),1)={r(i,:):0.1:r(i+1,:)};
    end
%�����һ���ϵ�����ʮ��֮�����������һ���ϵ㣬������Ϣ
rand_apnea=randi([r(N,:) (T+1)*Time-10],1,1);
C(N+1+T*(N+2),1)={r(N,:):0.1:rand_apnea};
C(N+2+T*(N+2),1)={rand_apnea:0.1:(T+1)*Time};


%�ֶ����ɺ����ź�
    for i =1:N+1
        %Biots������ٵĺ����׶� a��0.6��0.9�����b��2.25��3.14�����c��-0.05��+0.05�����d��-0.1��0.1���
        C{i+T*(N+2),2} =  Breathing(C{i+T*(N+2),1},randa2b(0.6,0.9,1),randa2b(2.25,3.14,1),randa2b(-0.05,0.05,1),randa2b(-0.1,0.1,1));
    end
%Biots��Ϣ�׶�
%a��-0.05��0.05�����b��0.01��3.14�����c��-0.05��+0.05�����d��-0.01��0.01���
C{N+2+T*(N+2),2}= Breathing(C{N+2+T*(N+2)},randa2b(-0.05,0.05,1),randa2b(0.01,3.14,1),randa2b(-0.2,0.2,1),randa2b(-0.01,0.01,1));

%����N���ϵ�
%     for i=1:N+1
%         C{i+T,2}(:,end)=C{i+1+T,2}(:,1);
%     end
end

%��Cell����mat
index=0;
for i=1:(N+2)*T_num
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

%���ƺ�������
% plot(mat(:,1),mat(:,2));
% title('Biots')
% xlabel('Time')
% ylabel('Intensity')
% axis([0 Time*(T+1) -2 2]);
