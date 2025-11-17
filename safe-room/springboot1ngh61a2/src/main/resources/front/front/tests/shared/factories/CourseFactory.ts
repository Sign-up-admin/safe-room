import { BaseFactory, factoryManager } from './BaseFactory';

/**
 * 课程接口定义
 */
export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // 分钟
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'active' | 'inactive' | 'cancelled';
  schedule: {
    startDate: Date;
    endDate: Date;
    daysOfWeek: number[]; // 0-6, 0=周日
    startTime: string; // HH:mm
    endTime: string;
  };
  tags: string[];
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 课程工厂类
 */
export class CourseFactory extends BaseFactory<Course> {
  private readonly categories = [
    '瑜伽', '健身', '普拉提', '舞蹈', '武术', '游泳', '跑步', '骑行',
    '力量训练', '有氧运动', '体操', '搏击', '太极', '冥想'
  ];

  private readonly levels: Course['level'][] = ['beginner', 'intermediate', 'advanced'];
  private readonly statuses: Course['status'][] = ['active', 'inactive', 'cancelled'];

  create(overrides: Partial<Course> = {}): Course {
    const id = overrides.id ?? this.nextId();
    const startDate = overrides.schedule?.startDate ?? this.randomDate();
    const duration = overrides.duration ?? this.randomNumber(30, 120);

    // 计算结束时间
    const startTime = overrides.schedule?.startTime ?? `${this.randomNumber(6, 20).toString().padStart(2, '0')}:00`;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDateTime = new Date(startDate);
    endDateTime.setHours(hours, minutes + duration);

    return this.mergeDefaults({
      id,
      title: `${this.randomFromArray(this.categories)}课程_${id}`,
      description: `这是一门关于${this.randomFromArray(this.categories)}的专业课程，适合所有健身爱好者。`,
      instructor: `教练${this.randomString(3)}`,
      category: this.randomFromArray(this.categories),
      level: this.randomFromArray(this.levels),
      duration,
      price: this.randomNumber(50, 500),
      maxParticipants: this.randomNumber(5, 30),
      currentParticipants: 0,
      status: this.randomFromArray(this.statuses),
      schedule: {
        startDate,
        endDate: overrides.schedule?.endDate ?? new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000)), // 7天后结束
        daysOfWeek: overrides.schedule?.daysOfWeek ?? [this.randomNumber(1, 5)], // 周一到周五随机
        startTime,
        endTime: `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`,
      },
      tags: this.generateTags(),
      rating: Math.round((3 + Math.random() * 2) * 10) / 10, // 3.0-5.0
      reviewCount: this.randomNumber(0, 200),
      imageUrl: `https://picsum.photos/400/300?random=${id}`,
      createdAt: startDate,
      updatedAt: new Date(startDate.getTime() + this.randomNumber(0, 86400000)),
    }, overrides);
  }

  /**
   * 生成课程标签
   */
  private generateTags(): string[] {
    const allTags = [
      '热门', '精品', '新课', '团课', '私教', '减肥', '塑形', '康复',
      '入门', '进阶', '高手', '燃脂', '增肌', '柔韧', '平衡', '力量'
    ];

    const tagCount = this.randomNumber(1, 4);
    const tags: string[] = [];

    for (let i = 0; i < tagCount; i++) {
      const tag = this.randomFromArray(allTags);
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }

    return tags;
  }

  /**
   * 创建热门课程
   */
  createPopularCourse(overrides: Partial<Course> = {}): Course {
    return this.create({
      rating: 4.5 + Math.random() * 0.5, // 4.5-5.0
      reviewCount: this.randomNumber(50, 200),
      currentParticipants: this.randomNumber(10, 25),
      tags: ['热门', '精品', ...this.generateTags().slice(0, 2)],
      ...overrides,
    });
  }

  /**
   * 创建新课程
   */
  createNewCourse(overrides: Partial<Course> = {}): Course {
    const createdAt = new Date();
    return this.create({
      createdAt,
      updatedAt: createdAt,
      tags: ['新课', ...this.generateTags().slice(0, 2)],
      ...overrides,
    });
  }

  /**
   * 创建满员课程
   */
  createFullCourse(overrides: Partial<Course> = {}): Course {
    const maxParticipants = overrides.maxParticipants ?? this.randomNumber(5, 20);
    return this.create({
      maxParticipants,
      currentParticipants: maxParticipants,
      ...overrides,
    });
  }

  /**
   * 创建课程列表
   */
  createCourseList(count: number, baseOverrides: Partial<Course> = {}): Course[] {
    return this.createMany(count, baseOverrides);
  }

  /**
   * 创建指定类别的课程
   */
  createCoursesByCategory(category: string, count: number): Course[] {
    return this.createMany(count, { category });
  }
}

// 注册课程工厂
const courseFactory = new CourseFactory();
factoryManager.register('course', courseFactory);

// 导出工厂实例
export { courseFactory };
export default courseFactory;
