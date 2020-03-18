function mat= Bradypnea(Time,N)

%Example:Bradypnea
%ÿ���Ӻ���12������
%�������Ϊ0.1s���趨ʱ��ΪTime
%Time=60;
%�����0��Time���������ڲ���N���ϵ㣬������
%N=30;
r =sort( randi([0 Time],N,1));

%����N+1������
C(1,1)={0:0.1:r(1,:)};
for i = 1:N-1
    C(i+1,1)={r(i,:):0.1:r(i+1,:)};
end
C(N+1,1)={r(N,:):0.1:Time};

%�ֶ����ɺ����ź�
for i =1:N+1
    %Bradypnea a��0.3��0.5�����b��0.79��1.15�����c��-0.05��+0.05�����d��-0.1��0.1���
    C{i,2} =  Breathing(C{i,1},randa2b(0.3,0.5,1),randa2b(0.79,1.15,1),randa2b(-0.05,0.05,1),randa2b(-0.1,0.1,1));
end
%����N���ϵ�

for i=1:N
    C{i,2}(:,end)=C{i+1,2}(:,1);
end

%��Cell����mat
index=0;
for i=1:N+1
    for j=1:length(C{i,1})-1
    index= index+1;
    %mat(index,1) = C{i,1}(j);
    mat(1,index) = C{i,2}(j);
    end
end
%��Ӹ�˹������SNRΪ20
mat(:,1) = awgn(mat(:,1),20,'measured');
%����mat
%save F:\mat\Eupnea\test1 mat

